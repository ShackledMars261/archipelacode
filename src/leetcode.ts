/** @format */
import * as vscode from "vscode";
import { apVerifier } from "./apVerifier";
import { globalState } from "./globalState";
import { archipelacodeChannel } from "./outputChannel";
import {
  queryUserData,
  recentSubmissions,
  submissionDetails,
  type RecentSubmission,
} from "./requests/requests";
import { Endpoint, getUrl, urls, urlsCn, UserStatus } from "./shared";
import { getLeetCodeEndpoint, openUrl, parseQuery, sleep } from "./utils";
export { queryQuestionDetail } from "./requests/requests";

/**
 * A submission row exists as soon as it is queued; statusDisplay stays empty
 * (and briefly reads "Pending"/"Judging") until the judge returns a verdict.
 */
const PENDING_STATUSES = ["", "pending", "judging", "started"];

const isJudged = (s: RecentSubmission): boolean =>
  !PENDING_STATUSES.includes((s.statusDisplay ?? "").trim().toLowerCase());

class LeetCodeController {
  cookie: string;
  currentUser: string | undefined;
  private userStatus: UserStatus;

  constructor() {
    this.cookie = "";
    this.userStatus = UserStatus.SignedOut;
    this.currentUser = undefined;
    this.handleUriSignIn = this.handleUriSignIn.bind(this);
  }

  async initializeClient(
    cookie: string | undefined,
    expiration: number | undefined,
  ) {
    if (cookie === undefined || expiration === undefined) {
      openUrl(this.getAuthLoginUrl());
    } else {
      if (expiration > Date.now()) {
        const data = await queryUserData();
        globalState.setUserStatus(data);
        if (data.username) {
          vscode.window.showInformationMessage(
            `Successfully logged in as ${data.username}.`,
          );
          this.currentUser = data.username;
          this.userStatus = UserStatus.SignedIn;
        } else {
          vscode.window.showErrorMessage(
            "An error occurred while reconnecting to LeetCode. Please connect again.",
          );
        }
      } else {
        openUrl(this.getAuthLoginUrl());
      }
    }
  }

  public async handleUriSignIn(uri: vscode.Uri): Promise<void> {
    try {
      await vscode.window.withProgress(
        { location: vscode.ProgressLocation.Notification },
        async (progress: vscode.Progress<{}>) => {
          progress.report({ message: "Fetching user data..." });
          const queryParams = parseQuery(uri.query);
          const cookie = queryParams["cookie"];
          if (!cookie) {
            vscode.window.showErrorMessage(
              `Failed to get cookie. Please log in again`,
            );
            return;
          }
          await this.updateUserStatusWithCookie(cookie, undefined);
        },
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to log in. Check debug console for details.`,
      );
      console.log(error);
    }
  }

  public async updateUserStatusWithCookie(
    cookie: string,
    expiration: number | undefined,
  ): Promise<void> {
    globalState.setCookie(cookie);
    globalState.setExpiration(expiration ?? Date.now() + 86400000);
    const data = await queryUserData();
    globalState.setUserStatus(data);
    if (data.username) {
      vscode.window.showInformationMessage(
        `Successfully logged in as ${data.username}.`,
      );
      this.currentUser = data.username;
      this.userStatus = UserStatus.SignedIn;
    }
  }

  public getAuthLoginUrl(): string {
    switch (getLeetCodeEndpoint()) {
      case Endpoint.LeetCodeCN:
        return urlsCn.authLoginUrl;
      case Endpoint.LeetCode:
      default:
        return urls.authLoginUrl;
    }
  }

  public getUser(): string | undefined {
    return this.currentUser;
  }

  /**
   * Waits for the player to submit this problem on leetcode.com and returns
   * whether it was accepted.
   *
   * The extension cannot submit on the player's behalf: LeetCode's
   * interpret_solution/submit routes sit behind a Cloudflare rule that
   * challenges the Electron extension host's TLS fingerprint, and no header,
   * cookie or cipher configuration reachable from here gets past it. GraphQL
   * reads are unaffected, so the player submits in the browser and we watch the
   * submission list instead.
   */
  public async submitSolution(
    titleSlug: string,
    fileContents: string,
    lang: string,
  ): Promise<boolean> {
    // Check the editor's code first, so an unmet item gate is reported before
    // sending the player off to the browser. The authoritative check happens
    // against the submitted code below.
    if (!(await apVerifier.verifySubmission(lang, fileContents))) {
      vscode.window.showErrorMessage(
        `Your solution uses language features you haven't unlocked yet. Please check the "ArchipelaCode" output channel.`,
      );
      return false;
    }

    const username =
      this.currentUser ?? globalState.getUserStatus()?.username ?? "";
    if (!username) {
      vscode.window.showErrorMessage(
        "Not signed in to LeetCode. Run the start command and log in first.",
      );
      return false;
    }

    // The player may have solved this problem long before the randomizer asked
    // for it, and may submit it many times. Only submissions newer than this
    // baseline count.
    const since = await this.latestSubmissionTimestamp(username, titleSlug);
    archipelacodeChannel.appendLine(
      `Watching for a new submission of "${titleSlug}" (baseline ts=${since}).`,
    );

    openUrl(`${getUrl("problemUrl")}${titleSlug}/`);

    const submission = await this.waitForNewSubmission(
      username,
      titleSlug,
      since,
    );
    if (!submission) {
      return false;
    }

    return await this.verifySubmittedCode(submission);
  }

  /** Newest submission timestamp for a problem, or 0 if never submitted. */
  private async latestSubmissionTimestamp(
    username: string,
    titleSlug: string,
  ): Promise<number> {
    try {
      const recent = await recentSubmissions(username);
      const mine = recent.filter((s) => s.titleSlug === titleSlug);
      return mine.reduce((max, s) => Math.max(max, Number(s.timestamp)), 0);
    } catch (error) {
      archipelacodeChannel.appendLine(`Could not read baseline: ${error}`);
      return Math.floor(Date.now() / 1000);
    }
  }

  private async waitForNewSubmission(
    username: string,
    titleSlug: string,
    since: number,
  ): Promise<RecentSubmission | undefined> {
    const POLL_MS = 5000;
    const TIMEOUT_MS = 15 * 60 * 1000;
    // A single failed poll is usually a blip; several in a row means the
    // session has expired, and silently retrying for the full timeout leaves
    // the player staring at a spinner with no idea why.
    const MAX_CONSECUTIVE_FAILURES = 3;

    return vscode.window.withProgress(
      {
        location: vscode.ProgressLocation.Notification,
        title: `Waiting for your LeetCode submission of "${titleSlug}"...`,
        cancellable: true,
      },
      async (progress, token) => {
        const deadline = Date.now() + TIMEOUT_MS;
        const reported = new Set<string>();
        let failures = 0;

        while (Date.now() < deadline) {
          if (token.isCancellationRequested) {
            return undefined;
          }
          await sleep(POLL_MS);
          if (token.isCancellationRequested) {
            return undefined;
          }

          let recent: RecentSubmission[];
          try {
            recent = await recentSubmissions(username);
            failures = 0;
          } catch (error) {
            failures++;
            archipelacodeChannel.appendLine(`Poll failed: ${error}`);
            if (failures >= MAX_CONSECUTIVE_FAILURES) {
              vscode.window.showErrorMessage(
                `Can't read your LeetCode submissions: ${error}. Your session may have expired - try logging in again.`,
              );
              return undefined;
            }
            continue;
          }

          const fresh = recent
            .filter(
              (s) => s.titleSlug === titleSlug && Number(s.timestamp) > since,
            )
            .sort((a, b) => Number(a.timestamp) - Number(b.timestamp));

          const accepted = fresh.find((s) => s.statusDisplay === "Accepted");
          if (accepted) {
            return accepted;
          }

          // A submission row appears the moment it is queued, with an empty
          // statusDisplay until the judge finishes. Keep waiting on those, and
          // keep waiting after a rejection too, so the player can just fix the
          // code and submit again without re-running the command.
          for (const s of fresh) {
            if (!isJudged(s) || reported.has(s.id)) {
              continue;
            }
            reported.add(s.id);
            archipelacodeChannel.appendLine(
              `Submission ${s.id}: ${s.statusDisplay}`,
            );
            progress.report({
              message: `LeetCode returned "${s.statusDisplay}" - still watching, submit again when fixed.`,
            });
          }
        }

        vscode.window.showWarningMessage(
          `Gave up waiting for a submission of "${titleSlug}".`,
        );
        return undefined;
      },
    );
  }

  /**
   * Re-runs the item gate against the code LeetCode actually judged. Without
   * this, submitting in the browser would bypass the Archipelago restrictions
   * entirely.
   */
  private async verifySubmittedCode(
    submission: RecentSubmission,
  ): Promise<boolean> {
    let details: { code: string; lang: string } | undefined;
    try {
      details = await submissionDetails(submission.id);
    } catch (error) {
      archipelacodeChannel.appendLine(
        `Could not fetch submitted code: ${error}`,
      );
    }

    if (!details) {
      // Don't hand out a check for code we were unable to inspect.
      vscode.window.showErrorMessage(
        `Could not read back submission ${submission.id} to verify it. No check sent.`,
      );
      return false;
    }

    archipelacodeChannel.appendLine(
      `Verifying submission ${submission.id} (lang="${details.lang}").`,
    );
    if (!(await apVerifier.verifySubmission(details.lang, details.code))) {
      vscode.window.showErrorMessage(
        `That submission was accepted, but it uses language features you haven't unlocked yet, so no check was sent. Check the "ArchipelaCode" output channel.`,
      );
      return false;
    }
    return true;
  }
}

export const leetCodeController: LeetCodeController = new LeetCodeController();

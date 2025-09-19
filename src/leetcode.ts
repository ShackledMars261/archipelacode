/** @format */
import * as vscode from "vscode";
import { apVerifier } from "./apVerifier";
import { globalState } from "./globalState";
import { archipelacodeChannel } from "./outputChannel";
import {
  checkRuncode,
  interpretSolution,
  queryQuestionDetail,
  queryUserData,
} from "./requests/requests";
import { Endpoint, urls, urlsCn, UserStatus } from "./shared";
import { getLeetCodeEndpoint, openUrl, parseQuery, sleep } from "./utils";
export { queryQuestionDetail } from "./requests/requests";

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

  async initializeClient() {
    // const picks: Array<IQuickItemEx<string>> = [];
    //
    // picks.push(
    // {
    // label: "Web Authorization",
    // detail: "Open browser to authorize login on the website",
    // value: "WebAuth",
    // description: "[Recommended]",
    // },
    // {
    // label: "LeetCode Cookie (CURRENTLY UNSUPPORTED)",
    // detail: "Use LeetCode cookie copied from browser to login",
    // value: "Cookie  ",
    // },
    // );
    //
    // const choice: IQuickItemEx<string> | undefined =
    // await vscode.window.showQuickPick(picks);
    // if (!choice) {
    // return;
    // }
    // const loginMethod: string = choice.value;
    //
    // if (loginMethod === "WebAuth") {
    // openUrl(this.getAuthLoginUrl());
    // return;
    // }
    openUrl(this.getAuthLoginUrl());
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
          await this.updateUserStatusWithCookie(cookie);
        },
      );
    } catch (error) {
      vscode.window.showErrorMessage(
        `Failed to log in. Check debug console for details.`,
      );
      console.log(error);
    }
  }

  public async updateUserStatusWithCookie(cookie: string): Promise<void> {
    globalState.setCookie(cookie);
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

  public async submitSolution(
    titleSlug: string,
    fileContents: string,
    lang: string,
  ): Promise<boolean> {
    archipelacodeChannel.appendLine(fileContents);
    archipelacodeChannel.appendLine(lang);
    archipelacodeChannel.appendLine(titleSlug);
    let question = await queryQuestionDetail(titleSlug);
    if (await apVerifier.verifySubmission(lang, fileContents)) {
      let interpretResponse = await interpretSolution(
        titleSlug,
        Number(question.questionId),
        lang,
        fileContents,
        question.exampleTestcaseList.join("\n"),
      );
      let runCode = interpretResponse["interpret_id"];
      let resp = await checkRuncode(runCode, titleSlug);
      let state = resp["state"];
      while (state === "PENDING" || state === "STARTED") {
        await sleep(1000);
        resp = await checkRuncode(runCode, titleSlug);
        state = resp["state"];
      }
      archipelacodeChannel.appendLine(resp.state);
      archipelacodeChannel.appendLine(resp.correct_answer);
      let result = resp["correct_answer"];
      return result;
    } else {
      vscode.window.showErrorMessage(
        `Your solution uses language features you haven't unlocked yet. Please try again.`,
      );
      return false;
    }
  }
}

export const leetCodeController: LeetCodeController = new LeetCodeController();

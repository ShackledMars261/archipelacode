/** @format */
import { getUrl } from "../shared";
import { APAxios } from "../utils";

export type RecentSubmission = {
  id: string;
  titleSlug: string;
  /** Unix seconds, as a string. */
  timestamp: string;
  /** "Accepted", "Wrong Answer", "Time Limit Exceeded", ... */
  statusDisplay: string;
  lang: string;
};

/**
 * LeetCode answers an expired session with HTTP 200 and an `errors` array
 * rather than a status code, so reading `data` straight off the response turns
 * a logged-out player into an endless stream of empty results.
 */
const graphql = async (
  query: string,
  variables: Record<string, unknown>,
): Promise<any> => {
  const res = await APAxios(getUrl("graphql"), {
    method: "POST",
    data: { query, variables },
  });
  const errors = res.data?.errors;
  if (Array.isArray(errors) && errors.length > 0) {
    throw new Error(errors.map((e: any) => e?.message ?? String(e)).join("; "));
  }
  return res.data?.data;
};

const recentSubmissionsQuery = `
    query recentSubmissions($username: String!, $limit: Int) {
        recentSubmissionList(username: $username, limit: $limit) {
            id
            titleSlug
            timestamp
            statusDisplay
            lang
        }
    }
`;

/**
 * Recent submissions for a user, newest first. Unlike interpret_solution this
 * is a plain GraphQL read, so it is not behind the Cloudflare rule that blocks
 * the extension host's TLS fingerprint.
 *
 * Only real submissions appear here - "Run" in the LeetCode editor produces an
 * ephemeral interpret_id and is never recorded.
 */
export const recentSubmissions = async (
  username: string,
  limit: number = 20,
): Promise<RecentSubmission[]> => {
  const data = await graphql(recentSubmissionsQuery, { username, limit });
  return data?.recentSubmissionList ?? [];
};

const submissionDetailsQuery = `
    query submissionDetails($submissionId: Int!) {
        submissionDetails(submissionId: $submissionId) {
            code
            lang {
                name
            }
        }
    }
`;

/**
 * The code actually submitted, so the Archipelago item gate can be enforced
 * against what LeetCode judged rather than whatever happens to be in the
 * editor. Returns undefined if the submission is not visible to this account.
 *
 * `lang.name` is the slug ("python3"), not the display name, but it is
 * lower-cased here anyway: the verifiers match the slug exactly and silently
 * pass anything they don't recognize.
 */
export const submissionDetails = async (
  submissionId: string,
): Promise<{ code: string; lang: string } | undefined> => {
  const data = await graphql(submissionDetailsQuery, {
    submissionId: Number(submissionId),
  });
  const details = data?.submissionDetails;

  if (!details?.code) {
    return undefined;
  }
  return {
    code: details.code,
    lang: (details.lang?.name ?? "").toLowerCase(),
  };
};

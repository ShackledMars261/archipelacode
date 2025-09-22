/** @format */
import * as vscode from "vscode";

export enum APStatus {
  NOT_RUNNING, // Extension currently isn't running
  DISCONNECTED, // Disconnected from Archipelago
  CONNECTING, // Attempting to connect to Archipelago
  CONNECTED, // Connected to Archipelago
  IN_CHALLENGE, // Currently in a LeetCode challenge
  DISCONNECTING, // Attempting to disconnect from Archipelago
}

export interface IQuickItemEx<T> extends vscode.QuickPickItem {
  value: T;
}

export enum Endpoint {
  LeetCode = "leetcode",
  LeetCodeCN = "leetcode-cn",
}

export enum UserStatus {
  SignedIn = 1,
  SignedOut = 2,
}

const protocol =
  vscode.env.appName.includes("Insiders") ? "vscode-insiders" : "vscode";

export const urls = {
  // base urls
  base: "https://leetcode.com",
  graphql: "https://leetcode.com/graphql",
  userGraphql: "https://leetcode.com/graphql",
  login: "https://leetcode.com/accounts/login/",
  authLoginUrl: `https://leetcode.com/authorize-login/${protocol}/?path=ShackledMars261.archipelacode`,
  interpretSolutionUrl: `https://leetcode.com/problems/PROBLEMSLUG/interpret_solution/`,
  checkSolutionUrl: `https://leetcode.com/submissions/detail/RUNCODE/check/`,
};

export const urlsCn = {
  // base urls
  base: "https://leetcode.cn",
  graphql: "https://leetcode.cn/graphql",
  userGraphql: "https://leetcode.cn/graphql/",
  login: "https://leetcode.cn/accounts/login/",
  authLoginUrl: `https://leetcode.cn/authorize-login/${protocol}/?path=ShackledMars261.archipelacode`,
  interpretSolutionUrl: `https://leetcode.cn/problems/PROBLEMSLUG/interpret_solution/`,
  checkSolutionUrl: `https://leetcode.cn/submissions/detail/RUNCODE/check/`,
};

// prettier-ignore
export const getUrl = (key: "base" | "graphql" | "userGraphql" | "login" | "authLoginUrl" | "interpretSolutionUrl" | "checkSolutionUrl") => {
  const leetCodeConfig: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration("archipelacode");
  const point = leetCodeConfig.get<string>(
    "leetCodeEndpoint",
    Endpoint.LeetCode,
  );
  switch (point) {
    case Endpoint.LeetCodeCN:
      return urlsCn[key];
    case Endpoint.LeetCode:
    default:
      return urls[key];
  }
};

export type ProblemDetail = {
  title: string;
  titleSlug: string;
  questionId: string;
  questionFrontendId: string;
  questionTitle: string;
  translatedTitle?: string;
  content: string;
  translatedContent?: string;
  categoryTitle: string;
  difficulty: string;
  stats: string;
  companyTagStatsV2?: string;
  topicTags: { name: string; slug: string; translatedName?: string }[];
  similarQuestionList: {
    difficulty: string;
    titleSlug: string;
    title: string;
    translatedTitle?: string;
    isPaidOnly: boolean;
  }[];
  mysqlSchemas?: any[];
  dataSchemas?: any[];
  frontendPreviews?: string;
  likes: number;
  dislikes: number;
  isPaidOnly: boolean;
  status?: number;
  canSeeQuestion: boolean;
  enableTestMode: boolean;
  metaData: string;
  enableRunCode: boolean;
  enableSubmit: boolean;
  enableDebugger: boolean;
  envInfo: string;
  isLiked?: boolean;
  nextChallenges: {
    difficulty: string;
    title: string;
    titleSlug: string;
    questionFrontendId: string;
  }[];
  libraryUrl?: string;
  adminUrl?: string;
  hints: string[];
  codeSnippets: { code: string; lang: string; langSlug: string }[];
  exampleTestcaseList: string[];
  hasFrontendPreview: boolean;
  featuredContests?: any[];
};

export enum Category {
  Unknown = "Unknown",
  Solved = "Solved",
  Available = "Available",
  Locked = "Locked",
  All = "All",
}

export enum State {
  Solved = 1,
  Unsolved = 2,
  Unknown = 3,
  Locked = 4,
}

export interface SubProblem {
  id: number;
  difficulty: string;
  title: string;
  titleSlug: string;
  problemUrl: string;
  locationId: number;
}

export interface Problem {
  id: number;
  difficulty: string;
  title: string;
  titleSlug: string;
  problemUrl: string;
  locationId: number;
  category: Category;
  state: State;
}

export const defaultProblem: Problem = {
  id: 0,
  difficulty: "",
  title: "",
  titleSlug: "",
  problemUrl: "",
  locationId: 0,
  category: Category.Unknown,
  state: State.Unknown,
};

export const langExt: Map<string, string> = new Map([
  ["bash", "sh"],
  ["c", "c"],
  ["cpp", "cpp"],
  ["csharp", "cs"],
  ["golang", "go"],
  ["java", "java"],
  ["javascript", "js"],
  ["kotlin", "kt"],
  ["mysql", "sql"],
  ["php", "php"],
  ["python3", "py"],
  ["python", "py"],
  ["ruby", "rb"],
  ["rust", "rs"],
  ["scala", "scala"],
  ["swift", "swift"],
  ["typescript", "ts"],
]);

export interface LangEnable {
  langSlug: string;
  enabled: boolean;
}

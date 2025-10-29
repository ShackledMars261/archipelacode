/** @format */
import axios, { AxiosPromise, AxiosRequestConfig } from "axios";
import * as cp from "child_process";
import { omit } from "lodash";
import * as vscode from "vscode";
import { globalState } from "./globalState";
import { Endpoint, langExt, VersionIdentifier } from "./shared";

export async function openUrl(url: string): Promise<void> {
  vscode.commands.executeCommand("vscode.open", vscode.Uri.parse(url));
}

export function getLeetCodeEndpoint(): string {
  const archipelacodeConfig: vscode.WorkspaceConfiguration =
    vscode.workspace.getConfiguration("archipelacode");
  return archipelacodeConfig.get<string>("leetCodeEndpoint", Endpoint.LeetCode);
}

export function parseQuery(query: string): { [key: string]: string } {
  const queryObject: { [key: string]: string } = {};

  if (!query) {
    return queryObject;
  }

  const keyValuePairs = query.split("&");
  keyValuePairs.forEach((pair) => {
    const firstEqualsIndex = pair.indexOf("=");
    if (firstEqualsIndex !== -1) {
      const key = pair.substring(0, firstEqualsIndex);
      const value = pair.substring(firstEqualsIndex + 1);
      queryObject[decodeURIComponent(key)] = decodeURIComponent(value);
    } else {
      // If no equals sign is found, treat the whole string as key with empty value
      queryObject[decodeURIComponent(pair)] = "";
    }
  });

  return queryObject;
}

const referer = "vscode-ap-extension";

export function APAxios<T = any>(
  path: string,
  settings?: AxiosRequestConfig,
): AxiosPromise<T> {
  const cookie = globalState.getCookie();
  if (!cookie) {
    vscode.window.showErrorMessage(
      `Failed to obtain the cookie. Please log in again.`,
    );
    return Promise.reject("Failed to obtain the cookie.");
  }
  return axios(path, {
    headers: {
      referer,
      "content-type": "application/json",
      cookie,
      ...(settings && settings.headers),
    },
    xsrfCookieName: "csrftoken",
    xsrfHeaderName: "X-CSRFToken",
    ...(settings && omit(settings, "headers")),
  });
}

export interface IExecError extends Error {
  result?: string;
}

export function isIExecError(object: any): object is IExecError {
  return "result" in object;
}

function getHttpAgent(): string | undefined {
  return vscode.workspace.getConfiguration("http").get<string>("proxy");
}

export function createEnvOption(): {} {
  const proxy: string | undefined = getHttpAgent();
  if (proxy) {
    const env: any = Object.create(process.env);
    env.http_proxy = proxy;
    return env;
  }
  return process.env;
}

export async function executeCommand(
  command: string,
  args: string[],
  options: cp.SpawnOptions = { shell: true },
): Promise<string> {
  return new Promise(
    (resolve: (res: string) => void, reject: (e: Error) => void): void => {
      let result: string = "";

      const childProc: cp.ChildProcess = cp.spawn(command, args, {
        ...options,
        env: createEnvOption(),
      });

      childProc.stdout?.on("data", (data: string | Buffer) => {
        data = data.toString();
        result = result.concat(data);
        console.log(data);
      });

      childProc.stderr?.on("data", (data: string | Buffer) =>
        console.log(data.toString()),
      );

      childProc.on("error", reject);

      childProc.on("close", (code: number) => {
        if (code !== 0 || result.indexOf("ERROR") > -1) {
          const error: IExecError = new Error(
            `Command "${command} ${args.toString()}" failed with exit code "${code}".`,
          );
          if (result) {
            error.result = result; // leetcode-cli may print useful content by exit with error code
          }
          reject(error);
        } else {
          resolve(result);
        }
      });
    },
  );
}

export async function executeCommandWithProgress(
  message: string,
  command: string,
  args: string[],
  options: cp.SpawnOptions = { shell: true },
): Promise<string> {
  let result: string = "";
  await vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification },
    async (p: vscode.Progress<{}>) => {
      return new Promise<void>(
        async (
          resolve: () => void,
          reject: (e: Error) => void,
        ): Promise<void> => {
          p.report({ message });
          try {
            result = await executeCommand(command, args, options);
            resolve();
          } catch (e) {
            if (e instanceof Error) {
              reject(e);
            } else {
              console.log(`An unknown error has occured: ${e}`);
            }
          }
        },
      );
    },
  );
  return result;
}

interface KeyValuePairs {
  [key: string]: string;
}

export function parseCookie(cookie: string) {
  let output: KeyValuePairs = {};
  let strs = cookie.split(";");
  strs.forEach((str) => {
    let pair = str.split("=");
    output[pair[0]] = pair[1];
  });
  return output;
}

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export function getWorkspaceConfiguration(): vscode.WorkspaceConfiguration {
  return vscode.workspace.getConfiguration("leetcode");
}

export function shouldHideSolvedProblem(): boolean {
  return getWorkspaceConfiguration().get<boolean>("hideSolved", false);
}

export function countOccurrences<T>(arr: T[], value: T): number {
  return arr.filter((item) => item === value).length;
}

export function genFileExt(language: string): string {
  const ext: string | undefined = langExt.get(language);
  if (!ext) {
    throw new Error(`The language "${language}" is not supported.`);
  }
  return ext;
}

export async function isFileEmpty(uri: vscode.Uri): Promise<boolean> {
  try {
    const fileStat = await vscode.workspace.fs.stat(uri);
    // A file is considered empty if its size is 0 bytes.
    return fileStat.size === 0;
  } catch (error) {
    // Handle potential errors, e.g., file not found
    if (
      error instanceof vscode.FileSystemError &&
      error.code === "FileNotFound"
    ) {
      vscode.window.showErrorMessage(`File not found: ${uri.fsPath}`);
    } else {
      vscode.window.showErrorMessage(`Error checking file: ${String(error)}`);
    }
    return false; // Or re-throw the error depending on your error handling strategy
  }
}

export function findKeyByValue<K, V>(
  map: Map<K, V>,
  valueToFind: V,
): K | undefined {
  for (let [key, value] of map.entries()) {
    if (value === valueToFind) {
      return key;
    }
  }
  return undefined; // Value not found
}

export function versionStringToVersion(
  versionString: string,
): VersionIdentifier {
  const stringParts: string[] = versionString.split(".");
  const parts: number[] = stringParts.map((part: string) => Number(part));
  const version: VersionIdentifier = {
    major: parts[0],
    minor: parts[1],
    patch: parts[2],
  };
  return version;
}

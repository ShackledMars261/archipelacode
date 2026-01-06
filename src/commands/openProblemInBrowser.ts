/** @format */

import * as vscode from "vscode";
import { Endpoint, urls, urlsCn } from "../shared";
import { getLeetCodeEndpoint, openUrl } from "../utils";

export function openProblemInBrowser() {
  if (vscode.workspace.workspaceFolders !== undefined) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      let filename: string;
      if (process.platform === "win32") {
        filename =
          editor.document.fileName.split("\\")[
            editor.document.fileName.split("\\").length - 1
          ];
      } else {
        filename =
          editor.document.fileName.split("/")[
            editor.document.fileName.split("/").length - 1
          ];
      }
      let titleSlug = filename.split(".")[0];
      let url = getProblemUrl(titleSlug);
      openUrl(url);
    } else {
      vscode.window.showErrorMessage("No open editor found.");
    }
  } else {
    vscode.window.showErrorMessage("Please open a folder and try again.");
  }
}

function getProblemUrl(titleSlug: string): string {
  switch (getLeetCodeEndpoint()) {
    case Endpoint.LeetCodeCN:
      return `${urlsCn.problemUrl}${titleSlug}/`;
    case Endpoint.LeetCode:
    default:
      return `${urls.problemUrl}${titleSlug}/`;
  }
}

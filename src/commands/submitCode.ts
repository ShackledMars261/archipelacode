/** @format */
import * as vscode from "vscode";
import { apVerifier } from "../apVerifier";
import { apController } from "../archipelago";
import { leetCodeController } from "../leetcode";

export async function submitCode() {
  if (vscode.workspace.workspaceFolders !== undefined) {
    const editor = vscode.window.activeTextEditor;
    if (editor) {
      const fileContents = editor.document.getText();
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
      const titleSlug = filename.split(".")[0];
      const lang = apVerifier.getFileLanguage(filename);
      if (!(await apController.hasLocationBeenClaimedPreviously(titleSlug))) {
        vscode.window.showInformationMessage(
          "Opening the problem on LeetCode - submit it there and we'll pick it up.",
        );
        const result = await leetCodeController.submitSolution(
          titleSlug,
          fileContents,
          lang,
        );
        if (result) {
          vscode.window.showInformationMessage("Accepted! Sending check..");
          await apController.sendCheck(titleSlug);
        }
        // Every failure path (rejected, timed out, item gate not met) already
        // reports itself with the reason, and cancelling is deliberate, so
        // there is nothing to add here.
      } else {
        vscode.window.showInformationMessage(
          "You've already received the check for this problem. Try another!",
        );
      }
    } else {
      vscode.window.showErrorMessage("No open editor found.");
    }
  } else {
    vscode.window.showErrorMessage("Please open a folder and try again.");
  }
}

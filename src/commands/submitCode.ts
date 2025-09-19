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
      const filename =
        editor.document.fileName.split("/")[
          editor.document.fileName.split("/").length - 1
        ];
      let titleSlug = filename.split(".")[0];
      const lang = apVerifier.getFileLanguage(filename);
      if (!(await apController.hasLocationBeenClaimedPreviously(titleSlug))) {
        vscode.window.showInformationMessage("Submitting code to LeetCode..");
        const result = await leetCodeController.submitSolution(
          titleSlug,
          fileContents,
          lang,
        );
        if (result) {
          vscode.window.showInformationMessage("Success! Sending check..");
          await apController.sendCheck(titleSlug);
        } else {
          vscode.window.showInformationMessage(
            "Tests failed, please try again.",
          );
        }
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

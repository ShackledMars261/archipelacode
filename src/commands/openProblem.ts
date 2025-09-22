/** @format */

import * as vscode from "vscode";
import { apController } from "../archipelago";
import { queryQuestionDetail } from "../leetcode";
import { archipelacodeChannel } from "../outputChannel";
import { IQuickItemEx } from "../shared";
import { ArchipelaCodeTreeViewNode } from "../treeView/treeViewNode";
import { genFileExt, isFileEmpty } from "../utils";

export async function openProblem(node: ArchipelaCodeTreeViewNode) {
  const titleSlug = node.titleSlug;
  const problem = await queryQuestionDetail(titleSlug);
  if (await apController.hasLocationBeenClaimedPreviously(titleSlug)) {
    vscode.window.showInformationMessage(
      "You've already claimed this location!",
    );
  } else {
    const workspaceFolders = vscode.workspace.workspaceFolders;
    if (!workspaceFolders || workspaceFolders.length === 0) {
      vscode.window.showErrorMessage("No workspace folder open.");
      return;
    }
    let picks: Array<IQuickItemEx<string>> = [];
    let includedLangSlugs: string[] = [];
    apController.getEnabledLanguages().forEach((entry) => {
      if (entry.enabled) {
        includedLangSlugs.push(entry.langSlug);
      }
    });
    problem.codeSnippets.forEach((entry) => {
      if (includedLangSlugs.includes(entry.langSlug)) {
        picks.push({
          label: entry.lang,
          value: entry.langSlug,
        });
      }
    });

    const choice: IQuickItemEx<string> | undefined =
      await vscode.window.showQuickPick(picks);
    if (!choice) {
      return;
    }
    let langSlug = choice.value;
    let langExtension = genFileExt(langSlug);
    let fileName = `${titleSlug}.${langExtension}`;

    const rootUri = workspaceFolders[0].uri;
    const filePath = vscode.Uri.joinPath(rootUri, fileName);

    const wsedit = new vscode.WorkspaceEdit();
    wsedit.createFile(filePath, { ignoreIfExists: true });

    try {
      await vscode.workspace.applyEdit(wsedit);
    } catch {
      archipelacodeChannel.appendLine(
        `Failed to create file at path "${filePath.toString()}"`,
      );
    }

    await vscode.window.showTextDocument(
      await vscode.workspace.openTextDocument(filePath),
    );

    if (await isFileEmpty(filePath)) {
      let codeSnippet = problem.codeSnippets.find(
        (item) => item.langSlug === langSlug,
      );
      try {
        const encodedData = new TextEncoder().encode(codeSnippet?.code);
        await vscode.workspace.fs.writeFile(filePath, encodedData);
      } catch {
        archipelacodeChannel.appendLine("Error writing code snippet to file.");
      }
    }
  }
}

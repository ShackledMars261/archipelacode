/** @format */
import * as vscode from "vscode";
import { apVerifier } from "./apVerifier";
import { apController } from "./archipelago";
import * as commands from "./commands/commands";
import { globalState } from "./globalState";
import { leetCodeController } from "./leetcode";
import { archipelacodeChannel } from "./outputChannel";
import { archipelaCodeTreeItemDecorationProvider } from "./treeView/nodeDecorationProvider";
import { archipelaCodeTreeDataProvider } from "./treeView/treeDataProvider";
import { ArchipelaCodeTreeViewNode as ArchipelaCodeNode } from "./treeView/treeViewNode";

export function activate(context: vscode.ExtensionContext) {
  globalState.initialize(context);

  vscode.window.registerUriHandler({
    handleUri: leetCodeController.handleUriSignIn,
  });

  archipelaCodeTreeDataProvider.initialize(context);

  context.subscriptions.push(
    archipelacodeChannel,
    vscode.window.registerFileDecorationProvider(
      archipelaCodeTreeItemDecorationProvider,
    ),
    vscode.window.createTreeView("archipelacodeTreeView", {
      treeDataProvider: archipelaCodeTreeDataProvider,
      showCollapseAll: true,
    }),
    vscode.commands.registerCommand("archipelacode.start", async () => {
      await commands.start();
      await leetCodeController.initializeClient();
      await apVerifier.initialize();
      await archipelaCodeTreeDataProvider.refresh();
    }),
    vscode.commands.registerCommand("archipelacode.setStatus", async () => {
      apController.status = await commands.setStatus();
    }),
    vscode.commands.registerCommand("archipelacode.getStatus", () => {
      commands.getStatus();
    }),
    vscode.commands.registerCommand("archipelacode.apSendCheck", async () => {
      await commands.apSendCheck();
      await archipelaCodeTreeDataProvider.refresh();
    }),
    vscode.commands.registerCommand("archipelacode.submitCode", async () => {
      await commands.submitCode();
      await archipelaCodeTreeDataProvider.refresh();
    }),
    vscode.commands.registerCommand("archipelacode.resetMemento", () => {
      globalState.removeAll();
    }),
    vscode.commands.registerCommand(
      "archipelacode.refreshExplorer",
      async () => {
        vscode.window.showInformationMessage("Refreshing...");
        await archipelaCodeTreeDataProvider.refresh();
        vscode.window.showInformationMessage("Done!");
      },
    ),
    vscode.commands.registerCommand(
      "archipelacode.openProblem",
      async (node: ArchipelaCodeNode) => {
        await commands.openProblem(node);
      },
    ),
  );
}

export function deactivate() {}

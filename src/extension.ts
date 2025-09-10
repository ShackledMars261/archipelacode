/** @format */
import * as vscode from "vscode";
import * as commands from "./commands/commands";
import * as globals from "./globals";

let currentStatus = globals.APStatus.NOT_RUNNING;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("archipelacode.start", async () => {
      commands.start(currentStatus);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("archipelacode.setStatus", async () => {
      currentStatus = await commands.setStatus(currentStatus);
    }),
  );

  context.subscriptions.push(
    vscode.commands.registerCommand("archipelacode.getStatus", async () => {
      commands.getStatus(currentStatus);
    }),
  );
}

export function deactivate() {}

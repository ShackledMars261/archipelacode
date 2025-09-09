/** @format */

// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as archipelago from "./archipelago";
import * as leetcode from "./leetcode";
import * as enums from "./enums";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand("archipelacode.start", async () => {
      let apHostname = await vscode.window.showInputBox({
        placeHolder: "Hostname of your AP room (Ex. 'archipelago.gg')",
        prompt: "Please enter the hostname of your Archipelago room",
        value: "archipelago.gg",
      });
      apHostname ? apHostname : "archipelago.gg";
      let apPort = await vscode.window.showInputBox({
        placeHolder: "Port of your AP room (Ex. '42315')",
        prompt: "Please enter the port of your Archipelago room",
      });
      apPort ? Number(apPort) : 0;
      let apSlotname = await vscode.window.showInputBox({
        placeHolder: "Username in your AP room (Ex. 'ShackledMars')",
        prompt: "Please enter your username shown in your Archipelago room",
      });
      apSlotname ? apSlotname : "";
      let apPassword = await vscode.window.showInputBox({
        placeHolder: "Password for your AP room (leave blank if no password)",
        prompt: "Please enter the password for your Archipelago room",
      });
      apPassword ? apPassword : "";
      vscode.window.showInformationMessage(`https://${apHostname}:${apPort}`);
      vscode.window.showInformationMessage(`${apSlotname}`);
      vscode.window.showInformationMessage(`${apPassword}`);
    }),
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

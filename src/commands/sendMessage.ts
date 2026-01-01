/** @format */
import * as vscode from "vscode";
import { apController } from "../archipelago";

export async function sendMessage() {
  let message = await vscode.window.showInputBox({
    placeHolder: "Message to send",
    prompt: "Please enter the message or command to send",
  });
  message = message ? message : "";
  await apController.sendMessage(message);
}

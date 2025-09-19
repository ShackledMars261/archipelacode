/** @format */
import * as vscode from "vscode";
import { apController } from "../archipelago";

export async function apSendCheck() {
  let titleSlug = await vscode.window.showInputBox({
    placeHolder: "Name of the location to claim",
    prompt: "Please enter the location name to claim",
  });
  titleSlug = titleSlug ? titleSlug : "two-sum";
  apController.sendCheck(titleSlug);
}

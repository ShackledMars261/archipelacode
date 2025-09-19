/** @format */

import * as vscode from "vscode";
import { apController } from "../archipelago";
import * as shared from "../shared";

export async function start() {
  let apHostname = await vscode.window.showInputBox({
    placeHolder: "Hostname of your AP room (Ex. 'archipelago.gg')",
    prompt: "Please enter the hostname of your Archipelago room",
    value: "archipelago.gg",
  });
  apHostname = apHostname ? apHostname : "archipelago.gg";
  let apPortResp = await vscode.window.showInputBox({
    placeHolder: "Port of your AP room (Ex. '42315')",
    prompt: "Please enter the port of your Archipelago room",
  });
  let apPort = apPortResp ? Number(apPortResp) : 38281;
  let apSlotname = await vscode.window.showInputBox({
    placeHolder: "Username in your AP room (Ex. 'ShackledMars')",
    prompt: "Please enter your username shown in your Archipelago room",
  });
  apSlotname = apSlotname ? apSlotname : "Shackled";
  let apPassword = await vscode.window.showInputBox({
    placeHolder: "Password for your AP room (leave blank if no password)",
    prompt: "Please enter the password for your Archipelago room",
  });
  apPassword = apPassword ? apPassword : "";

  await apController.initializeClient(
    apHostname,
    apPort,
    apSlotname,
    apPassword,
    shared.APStatus.DISCONNECTED,
  );
  return apController;
}

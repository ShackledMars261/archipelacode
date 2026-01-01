/** @format */

import { apController } from "../archipelago";
import { APConnectionInfo, globalState } from "../globalState";

import * as vscode from "vscode";
import { leetCodeController } from "../leetcode";

export async function reconnect() {
  let connectionInfo: APConnectionInfo | undefined =
    globalState.getAPConnectionInfo();

  if (connectionInfo === undefined) {
    vscode.window.showErrorMessage(
      "Failed to get previous connection details. Please log in again.",
    );
  } else {
    await apController.disconnectIfConnected();
    await apController.initializeClient(
      connectionInfo.hostname,
      connectionInfo.port,
      connectionInfo.slotname,
      connectionInfo.password,
    );
    let cookie: string | undefined = globalState.getCookie();
    let expiration: number | undefined = globalState.getExpiration();
    await leetCodeController.initializeClient(cookie, expiration);
    return apController;
  }
}

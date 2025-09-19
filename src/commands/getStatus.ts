/** @format */

import * as vscode from "vscode";
import { apController } from "../archipelago";
import * as shared from "../shared";

export function getStatus() {
  vscode.window.showInformationMessage(
    Object.keys(shared.APStatus).filter((key) => isNaN(Number(key)))[
      Number(apController.status)
    ],
  );
}

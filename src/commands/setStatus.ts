/** @format */

import * as vscode from "vscode";
import { apController } from "../archipelago";
import * as shared from "../shared";

export async function setStatus() {
  let items: vscode.QuickPickItem[] = [];

  Object.keys(shared.APStatus)
    .filter((key) => isNaN(Number(key)))
    .forEach((value) => {
      items.push({ label: String(value) });
    });

  let result = await vscode.window.showQuickPick(items, {
    placeHolder: "What should the new status be?",
    canPickMany: false,
  });

  return shared.APStatus[
    (result ?
      result.label
    : apController.status.toString()) as keyof typeof shared.APStatus
  ];
}

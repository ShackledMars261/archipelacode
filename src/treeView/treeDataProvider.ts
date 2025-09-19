/** @format */
import path from "path";
import * as vscode from "vscode";
import { Category, State } from "../shared";
import { treeViewNodeManager } from "./nodeManager";
import { ArchipelaCodeTreeViewNode } from "./treeViewNode";

export class ArchipelaCodeTreeDataProvider
  implements vscode.TreeDataProvider<ArchipelaCodeTreeViewNode>
{
  private context!: vscode.ExtensionContext;

  private onDidChangeTreeDataEvent: vscode.EventEmitter<
    ArchipelaCodeTreeViewNode | undefined | null
  > = new vscode.EventEmitter<ArchipelaCodeTreeViewNode | undefined | null>();

  public onDidChangeTreeData: vscode.Event<any> =
    this.onDidChangeTreeDataEvent.event;

  public initialize(context: vscode.ExtensionContext): void {
    this.context = context;
  }

  public async refresh(): Promise<void> {
    await treeViewNodeManager.refreshCache();
    this.onDidChangeTreeDataEvent.fire(null);
  }

  public getTreeItem(
    element: ArchipelaCodeTreeViewNode,
  ): vscode.TreeItem | Thenable<vscode.TreeItem> {
    let contextValue: string;

    if (element.isProblem) {
      contextValue = element.titleSlug;
    } else {
      contextValue = element.title;
    }

    return {
      label: element.isProblem ? `${element.title}` : `${element.title}`,
      tooltip: this.getSubCategoryTooltip(element),
      collapsibleState:
        element.isProblem ?
          vscode.TreeItemCollapsibleState.None
        : vscode.TreeItemCollapsibleState.Collapsed,
      iconPath: this.getIconPath(element),
      command: element.isProblem ? element.command : undefined,
      resourceUri: element.uri,
      contextValue,
    };
  }

  public getChildren(
    element?: ArchipelaCodeTreeViewNode | undefined,
  ): vscode.ProviderResult<ArchipelaCodeTreeViewNode[]> {
    if (!element) {
      return treeViewNodeManager.getRootNodes();
    } else {
      switch (element.category) {
        case Category.All:
          return treeViewNodeManager.getAllNodes();
        case Category.Available:
          return treeViewNodeManager.getUnsolvedNodes();
        case Category.Solved:
          return treeViewNodeManager.getSolvedNodes();
        case Category.Locked:
          return treeViewNodeManager.getLockedNodes();
      }
    }
  }

  private getSubCategoryTooltip(element: ArchipelaCodeTreeViewNode): string {
    return element.titleSlug;
  }

  private getIconPath(element: ArchipelaCodeTreeViewNode): string {
    // return this.context.asAbsolutePath(
    // path.join("resources", "archipelago_icon.png"),
    // );
    if (!element.isProblem) {
      return "";
    }
    switch (element.state) {
      case State.Solved:
        return this.context.asAbsolutePath(
          path.join("resources", "green_checkmark.svg"),
        );
      case State.Unsolved:
        return this.context.asAbsolutePath(path.join("resources", "red_x.svg"));
      case State.Locked:
        return this.context.asAbsolutePath(
          path.join("resources", "padlock.svg"),
        );
      default:
        return "";
    }
  }
}

export const archipelaCodeTreeDataProvider: ArchipelaCodeTreeDataProvider =
  new ArchipelaCodeTreeDataProvider();

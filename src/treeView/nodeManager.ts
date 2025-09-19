/** @format */
import { Disposable } from "vscode";
import { apController } from "../archipelago";
import { Category, defaultProblem, State } from "../shared";
import { shouldHideSolvedProblem } from "../utils";
import { ArchipelaCodeTreeViewNode as TreeViewNode } from "./treeViewNode";

class TreeViewNodeManager implements Disposable {
  private nodeMap: Map<string, TreeViewNode> = new Map<string, TreeViewNode>();

  public dispose(): void {
    this.nodeMap.clear();
  }

  public async refreshCache(): Promise<void> {
    this.dispose();
    const shouldHideSolved: boolean = shouldHideSolvedProblem();
    for (const problem of await apController.getAllLocations()) {
      if (shouldHideSolved && problem.state === State.Solved) {
        continue;
      }
      this.nodeMap.set(problem.titleSlug, new TreeViewNode(problem));
    }
  }

  public getRootNodes(): TreeViewNode[] {
    return [
      new TreeViewNode(
        Object.assign({}, defaultProblem, {
          id: `${Category.All}`,
          name: "All",
          title: "All",
          isProblem: false,
          category: Category.All,
        }),
        false,
      ),
      new TreeViewNode(
        Object.assign({}, defaultProblem, {
          id: `${Category.Solved}`,
          name: "Solved",
          title: "Solved",
          isProblem: false,
          category: Category.Solved,
        }),
        false,
      ),
      new TreeViewNode(
        Object.assign({}, defaultProblem, {
          id: `${Category.Available}`,
          name: "Available",
          title: "Available",
          isProblem: false,
          category: Category.Available,
        }),
        false,
      ),
      new TreeViewNode(
        Object.assign({}, defaultProblem, {
          id: `${Category.Locked}`,
          name: "Locked",
          title: "Locked",
          isProblem: false,
          category: Category.Locked,
        }),
        false,
      ),
    ];
  }

  public getAllNodes(): TreeViewNode[] {
    return Array.from(this.nodeMap.values());
  }

  public getSolvedNodes(): TreeViewNode[] {
    return Array.from(this.nodeMap.values()).filter((node) => {
      return node.category === Category.Solved;
    });
  }

  public getUnsolvedNodes(): TreeViewNode[] {
    return Array.from(this.nodeMap.values()).filter((node) => {
      return node.category === Category.Available;
    });
  }

  public getLockedNodes(): TreeViewNode[] {
    return Array.from(this.nodeMap.values()).filter((node) => {
      return node.category === Category.Locked;
    });
  }
}

export const treeViewNodeManager: TreeViewNodeManager =
  new TreeViewNodeManager();

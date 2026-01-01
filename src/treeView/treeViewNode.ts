/** @format */
import * as vscode from "vscode";
import { Category, Problem, State } from "../shared";

export class ArchipelaCodeTreeViewNode {
  constructor(
    private data: Problem,
    private isProblemNode: boolean = true,
  ) {}

  public get id(): number {
    return this.data.id;
  }

  public get title(): string {
    return this.data.title;
  }

  public get titleSlug(): string {
    return this.data.titleSlug;
  }

  public get difficulty(): string {
    return this.data.difficulty;
  }

  public get isProblem(): boolean {
    return this.isProblemNode;
  }

  public get problemUrl(): string {
    return this.data.problemUrl;
  }

  public get locationId(): number {
    return this.data.locationId;
  }

  public get category(): Category {
    return this.data.category;
  }

  public get state(): State {
    return this.data.state;
  }

  public get command(): vscode.Command {
    return {
      title: "Open Problem",
      command: "archipelacode.openProblemInEditor", // Need to add command
      arguments: [this],
    };
  }

  public get uri(): vscode.Uri {
    return vscode.Uri.from({
      scheme: "archipelacode",
      authority: this.isProblem ? "problems" : "tree-node",
      path: `/${this.id}`, // path must begin with slash /
      query: `difficulty=${this.difficulty}`,
    });
  }
}

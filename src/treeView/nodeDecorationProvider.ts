/** @format */
import { URLSearchParams } from "url";
import {
  FileDecoration,
  FileDecorationProvider,
  ProviderResult,
  ThemeColor,
  Uri,
  workspace,
  WorkspaceConfiguration,
} from "vscode";

export class ArchipelaCodeTreeItemDecorationProvider
  implements FileDecorationProvider
{
  private readonly DIFFICULTY_LABEL: { [key: string]: string } = {
    easy: "E",
    medium: "M",
    hard: "H",
  };

  private readonly DIFFICULTY_COLOR: { [key: string]: ThemeColor } = {
    easy: new ThemeColor("charts.green"),
    medium: new ThemeColor("charts.yellow"),
    hard: new ThemeColor("charts.red"),
  };

  public provideFileDecoration(uri: Uri): ProviderResult<FileDecoration> {
    if (!this.isDifficultyBadgeEnabled()) {
      return;
    }

    if (uri.scheme !== "archipelacode" && uri.authority !== "problems") {
      return;
    }

    const params: URLSearchParams = new URLSearchParams(uri.query);
    const difficulty: string = params.get("difficulty")!.toLowerCase();
    return {
      badge: this.DIFFICULTY_LABEL[difficulty],
      color: this.DIFFICULTY_COLOR[difficulty],
    };
  }

  private isDifficultyBadgeEnabled(): boolean {
    const configuration: WorkspaceConfiguration = workspace.getConfiguration();
    return configuration.get<boolean>("archipelacode.colorizeProblems", false);
  }
}

export const archipelaCodeTreeItemDecorationProvider: ArchipelaCodeTreeItemDecorationProvider =
  new ArchipelaCodeTreeItemDecorationProvider();

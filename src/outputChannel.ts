/** @format */
import * as vscode from "vscode";

class ArchipelaCodeOutputChannel implements vscode.Disposable {
  private readonly channel: vscode.OutputChannel =
    vscode.window.createOutputChannel("ArchipelaCode");

  public appendLine(msg: string): void {
    this.channel.appendLine(msg);
  }

  public append(msg: string): void {
    this.channel.appendLine(msg);
  }

  public show(): void {
    this.channel.show();
  }

  public dispose(): void {
    this.channel.dispose();
  }
}

export const archipelacodeChannel: ArchipelaCodeOutputChannel =
  new ArchipelaCodeOutputChannel();

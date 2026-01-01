/** @format */
import { apController } from "../archipelago";
import { archipelacodeChannel } from "../outputChannel";

export function listItems() {
  let item_names: string[] = apController.getReceivedItemNames();
  archipelacodeChannel.appendLine("Current Items:");
  item_names.forEach((name) => {
    archipelacodeChannel.appendLine(` - ${name}`);
  });
}

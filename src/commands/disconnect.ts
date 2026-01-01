/** @format */

import { apController } from "../archipelago";
import { archipelacodeChannel } from "../outputChannel";

export async function disconnect() {
  await apController.disconnectIfConnected();
  archipelacodeChannel.appendLine("Disconnected from Archipelago.");
}

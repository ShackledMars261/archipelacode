/** @format */

export enum APStatus {
  NOT_RUNNING, // Extension currently isn't running
  DISCONNECTED, // Disconnected from Archipelago
  CONNECTING, // Attempting to connect to Archipelago
  CONNECTED, // Connected to Archipelago
  IN_CHALLENGE, // Currently in a LeetCode challenge
  DISCONNECTING, // Attempting to disconnect from Archipelago
}

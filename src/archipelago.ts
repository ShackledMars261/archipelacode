/** @format */
import * as vscode from "vscode";
import packageJson from "../package.json";
import problemsJson from "./data/problems.json";
import { archipelacodeChannel } from "./outputChannel";
import {
  APStatus,
  Category,
  LangEnable,
  Problem,
  State,
  SubProblem,
  VersionIdentifier,
} from "./shared";
import { archipelaCodeTreeDataProvider } from "./treeView/treeDataProvider";
import { countOccurrences, versionStringToVersion } from "./utils";

class ArchipelagoController {
  hostname: string = "archipelago.gg";
  port!: number;
  slotname!: string;
  password: string = "";
  status: APStatus = APStatus.DISCONNECTED;
  protocol: string = "ws";
  client: any;
  uuid: string = "";
  slotData!: import("archipelago.js", {
    with: { "resolution-mode": "import" }
  }).JSONRecord;

  constructor() {}

  getUrl(): string {
    return `${this.protocol}://${this.hostname}:${this.port}`;
  }

  async initializeClient(
    hostname = "archipelago.gg",
    port: number,
    slotname: string,
    password = "",
  ) {
    this.hostname = hostname;
    this.port = port;
    this.slotname = slotname;
    this.password = password;
    this.status = APStatus.CONNECTING;

    this.protocol = "ws";

    const { Client } = await import("archipelago.js");
    type Item = import("archipelago.js", {
      with: { "resolution-mode": "import" }
    }).Item;
    this.client = new Client();

    const uuid = await import("uuid");
    this.uuid = uuid.v4();

    // archipelacodeChannel.appendLine(`Your UUID: ${this.uuid}`);

    this.client.messages.on("message", (content: string) => {
      archipelacodeChannel.appendLine(content);
    });

    this.client.items.on(
      "itemsReceived",
      async (items: Item[], startingIndex: number) => {
        await this.receiveItem(items, startingIndex);
        await archipelaCodeTreeDataProvider.refresh();
      },
    );
    try {
      if (!this.password) {
        await this.client.login(this.getUrl(), this.slotname, "ArchipelaCode");
      } else {
        await this.client.login(this.getUrl(), this.slotname, "ArchipelaCode", {
          items: 7,
          password: this.password,
          slotData: true,
          tags: [],
          uuid: this.uuid,
          version: {
            build: 0,
            major: 6,
            minor: 3,
          },
        });
      }
    } catch {
      this.protocol = "wss";
      if (!this.password) {
        await this.client.login(this.getUrl(), this.slotname, "ArchipelaCode");
      } else {
        await this.client.login(this.getUrl(), this.slotname, "ArchipelaCode", {
          items: 7,
          password: this.password,
          slotData: true,
          tags: [],
          uuid: this.uuid,
          version: {
            build: 0,
            major: 6,
            minor: 3,
          },
        });
      }
    }
    this.slotData = await this.client.players.self.fetchSlotData();
    this.status = APStatus.CONNECTED;
    if (!this.checkVersion()) {
      vscode.window.showErrorMessage(
        "Extension is outdated! Please update the extension before continuing.",
      );
    }
  }

  async checkVersion(): Promise<boolean> {
    let extensionVersion: VersionIdentifier = versionStringToVersion(
      packageJson.version,
    );
    let metadata = this.slotData.metadata;
    let apworldVersion: VersionIdentifier = {
      major: 999,
      minor: 999,
      patch: 999,
    };
    if (metadata && typeof metadata === "object") {
      for (const [key, value] of Object.entries(metadata)) {
        if (key === "apworld_version") {
          apworldVersion = versionStringToVersion(String(value));
        }
      }
    }
    archipelacodeChannel.appendLine(
      `APWorld Version: ${apworldVersion.major}.${apworldVersion.minor}.${apworldVersion.patch}`,
    );
    archipelacodeChannel.appendLine(
      `Extension Version: ${extensionVersion.major}.${extensionVersion.minor}.${extensionVersion.patch}`,
    );
    let result: boolean = false;
    if (extensionVersion.major > apworldVersion.major) {
      result = true;
    } else if (
      extensionVersion.major === apworldVersion.major &&
      extensionVersion.minor > apworldVersion.minor
    ) {
      result = true;
    } else if (
      extensionVersion.major === apworldVersion.major &&
      extensionVersion.minor > apworldVersion.minor &&
      extensionVersion.patch >= apworldVersion.patch
    ) {
      result = true;
    }
    return result;
  }

  async hasLocationBeenClaimedPreviously(titleSlug: string): Promise<boolean> {
    let locationID = this.titleSlugToLocationId(titleSlug);
    return this.client.room.checkedLocations.includes(locationID);
  }

  async sendCheck(titleSlug: string) {
    let locationID = this.titleSlugToLocationId(titleSlug);
    archipelacodeChannel.appendLine(
      `Sending check for location '${locationID}'`,
    );
    await this.client.check(locationID);
    if (this.client.room.checkedLocations.length + 1 >= this.getEndGoal()) {
      this.client.goal();
    }
    await archipelaCodeTreeDataProvider.refresh();
  }

  titleSlugToLocationId(titleSlug: string): number {
    let locationID = -1;
    Object.entries(problemsJson.problems).forEach((entry) => {
      if (entry[0] === titleSlug) {
        locationID = entry[1].locationId;
      }
    });
    return locationID;
  }

  async receiveItem(
    items: import("archipelago.js", {
      with: { "resolution-mode": "import" }
    }).Item[],
    startingIndex: number,
  ) {
    if (!(this.status === APStatus.CONNECTING)) {
      items.forEach(async (item) => {
        vscode.window.showInformationMessage(
          `Received ${item.name} from ${item.sender.name}`,
        );
      });
    }
  }

  async isLocationLocked(entry: SubProblem): Promise<boolean> {
    if (await this.hasLocationBeenClaimedPreviously(entry.titleSlug)) {
      return false;
    } else {
      let regionId = await this.getRegionFromLocationId(entry.locationId);
      return !(
        countOccurrences(
          this.client.items.received.map((item: any) => item.id),
          6700902002,
        ) >= regionId
      );
    }
  }

  async isLocationIncluded(locationId: number): Promise<boolean> {
    if (this.client.room.allLocations.includes(locationId)) {
      return true;
    } else {
      return false;
    }
  }

  async getRegionFromLocationId(locationId: number): Promise<number> {
    let regions = this.slotData.regions;
    if (regions && typeof regions === "object") {
      for (const [key, locations] of Object.entries(regions)) {
        let regionId = Number(key);
        if (locations && typeof locations === "object") {
          for (const [locId, location] of Object.entries(locations)) {
            if (Number(locId) === locationId) {
              return regionId;
            }
          }
        }
      }
    }
    return 0;
  }

  getEndGoal(): number {
    let metadata = this.slotData.metadata;
    if (metadata && typeof metadata === "object") {
      for (const [key, value] of Object.entries(metadata)) {
        if (key === "EndGoal") {
          return Number(value);
        }
      }
    }
    return -1;
  }

  getEnabledLanguages(): LangEnable[] {
    let result: LangEnable[] = [];
    let metadata = this.slotData.metadata;
    if (metadata && typeof metadata === "object") {
      for (const [key, value] of Object.entries(metadata)) {
        if (key === "included_languages") {
          if (value && typeof value === "object") {
            for (const [lang, enabled] of Object.entries(value)) {
              result.push({
                langSlug: lang,
                enabled: Boolean(enabled),
              });
            }
          }
        }
      }
    }
    return result;
  }

  async getAllLocations(): Promise<Problem[]> {
    let problems: Problem[] = [];
    for (const [name, entry] of Object.entries(problemsJson.problems)) {
      if (await this.isLocationIncluded(entry.locationId)) {
        problems.push({
          id: entry.id,
          difficulty: entry.difficulty,
          title: entry.title,
          titleSlug: entry.titleSlug,
          problemUrl: entry.problemUrl,
          locationId: entry.locationId,
          category:
            (await this.isLocationLocked(entry)) ? Category.Locked
            : (await this.hasLocationBeenClaimedPreviously(entry.titleSlug)) ?
              Category.Solved
            : Category.Available,
          state:
            (await this.isLocationLocked(entry)) ? State.Locked
            : (await this.hasLocationBeenClaimedPreviously(entry.titleSlug)) ?
              State.Solved
            : State.Unsolved,
        });
      }
    }
    return problems;
  }
}

export const apController: ArchipelagoController = new ArchipelagoController();

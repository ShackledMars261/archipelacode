/** @format */
import { apController } from "./archipelago";
import { BaseLanguageVerifier } from "./languages/base_lang_verifier";
import {
  javascriptVerifier,
  pythonVerifier,
  universalVerifier,
} from "./languages/languages";
import { archipelacodeChannel } from "./outputChannel";
import { langExt } from "./shared";
import { findKeyByValue } from "./utils";

class APVerifier {
  languageVerifiers: BaseLanguageVerifier[] = [
    pythonVerifier,
    javascriptVerifier,
  ];
  includedVerifiers: BaseLanguageVerifier[] = [];

  constructor() {}

  public async initialize() {
    this.includedVerifiers = [];
    let includedLanguages = apController.getEnabledLanguages();
    for (const language of includedLanguages) {
      if (language.enabled) {
        this.languageVerifiers.forEach((verifier) => {
          if (verifier.langSlugs.includes(language.langSlug)) {
            this.includedVerifiers.push(verifier);
          }
        });
      }
    }
    this.includedVerifiers.push(universalVerifier);
  }

  public async verifySubmission(
    lang: string,
    fileContents: string,
  ): Promise<boolean> {
    let isValid = true;
    let result: boolean;
    let missingItems: number[];
    let totalMissingItems: number[] = [];
    this.includedVerifiers.forEach((verifier) => {
      if (verifier.langSlugs.includes(lang)) {
        [result, missingItems] = verifier.verify(fileContents);
        if (!result) {
          isValid = false;
          totalMissingItems = totalMissingItems.concat(missingItems);
        }
      }
    });
    if (totalMissingItems.length > 0) {
      archipelacodeChannel.appendLine("You are missing the following items:");
      totalMissingItems.forEach((itemId) => {
        archipelacodeChannel.appendLine(
          `- ${apController.itemIdToName(itemId)}`,
        );
      });
    }
    return isValid;
  }

  public getFileLanguage(fileName: string) {
    const fileExt = fileName.split(".")[fileName.split(".").length - 1];
    return findKeyByValue(langExt, fileExt) || "python3";
  }
}

export const apVerifier: APVerifier = new APVerifier();

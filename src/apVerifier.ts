/** @format */
import { apController } from "./archipelago";
import { BaseLanguageVerifier } from "./languages/base_lang_verifier";
import {
  javascriptVerifier,
  pythonVerifier,
  universalVerifier,
} from "./languages/languages";
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
    this.includedVerifiers.forEach((verifier) => {
      if (verifier.langSlugs.includes(lang)) {
        if (!verifier.verify(fileContents)) {
          isValid = false;
        }
      }
    });
    return isValid;
  }

  public getFileLanguage(fileName: string) {
    const fileExt = fileName.split(".")[fileName.split(".").length - 1];
    return findKeyByValue(langExt, fileExt) || "python3";
  }
}

export const apVerifier: APVerifier = new APVerifier();

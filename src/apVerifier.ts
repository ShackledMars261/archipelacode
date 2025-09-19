/** @format */
import { BaseLanguageVerifier } from "./languages/base_lang_verifier";
import { pythonVerifier, universalVerifier } from "./languages/languages";
import { langExt } from "./shared";
import { findKeyByValue } from "./utils";

class APVerifier {
  verifiers: BaseLanguageVerifier[] = [pythonVerifier, universalVerifier];

  constructor() {}

  public async verifySubmission(
    lang: string,
    fileContents: string,
  ): Promise<boolean> {
    let isValid = true;
    this.verifiers.forEach((verifier) => {
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

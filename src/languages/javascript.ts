/** @format */

import { apController } from "../archipelago";
import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class JavascriptVerifier implements BaseLanguageVerifier {
  langSlugs: string[] = ["javascript"];
  regexes: RegExEntry[] = [];

  constructor() {}

  async verify(fileContents: string): Promise<boolean> {
    this.regexes.forEach((entry) => {
      if (apController.client.items.received.includes(entry.itemId)) {
        entry.disabled = true;
      }
    });

    let isValid = true;
    let lines = fileContents.split("\n");
    lines.forEach((line) => {
      this.regexes.forEach((entry) => {
        if (!entry.disabled) {
          if (entry.regex.test(line)) {
            isValid = false;
          }
        }
      });
    });
    return isValid;
  }
}

export const javascriptVerifier: JavascriptVerifier = new JavascriptVerifier();

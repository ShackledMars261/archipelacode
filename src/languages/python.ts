/** @format */

import { apController } from "../archipelago";
import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class PythonVerifier implements BaseLanguageVerifier {
  langSlugs: string[] = ["python", "python3"];
  regexes: RegExEntry[] = [
    {
      itemId: 6700903101,
      regex: new RegExp("for"),
      disabled: false,
    },
  ];

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

export const pythonVerifier: PythonVerifier = new PythonVerifier();

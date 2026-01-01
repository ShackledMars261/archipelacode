/** @format */

import { apController } from "../archipelago";
import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class JavascriptVerifier implements BaseLanguageVerifier {
  langSlugs: string[] = ["javascript"];
  lastGeneratedLineRegex: RegExp = new RegExp(
    "\\t| *(var)\\s+\\w*\\s*=\\s*(async\\s*)?(function)\\(.*\\)\\s*{$",
  );
  regexes: RegExEntry[] = [];

  constructor() {}

  verify(fileContents: string): [boolean, number[]] {
    this.regexes.forEach((entry) => {
      if (apController.client.items.received.includes(entry.itemId)) {
        entry.disabled = true;
      }
    });

    let isInUserCode = false;
    let isValid = true;
    let missingItems: number[] = [];
    let lines = fileContents.split("\n");
    lines.forEach((line) => {
      if (!isInUserCode) {
        if (this.lastGeneratedLineRegex.test(line)) {
          isInUserCode = true;
        }
        return;
      }
      if (!this.checkIfLineIsAComment(line)) {
        this.regexes.forEach((entry) => {
          if (!entry.disabled) {
            if (entry.regex.test(line)) {
              missingItems.push(entry.itemId);
              isValid = false;
            }
          }
        });
      }
    });
    return [isValid, missingItems];
  }

  checkIfLineIsAComment(line: string): boolean {
    let isComment: boolean = false;
    let trimmedLine: string = line.trimStart();
    if (trimmedLine.indexOf("/*") === 0) {
      isComment = true;
    }
    if (trimmedLine.indexOf("* ") === 0) {
      isComment = true;
    }

    return isComment;
  }
}

export const javascriptVerifier: JavascriptVerifier = new JavascriptVerifier();

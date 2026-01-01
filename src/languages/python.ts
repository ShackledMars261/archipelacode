/** @format */

import { apController } from "../archipelago";
import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class PythonVerifier implements BaseLanguageVerifier {
  langSlugs: string[] = ["python", "python3"];
  lastGeneratedLineRegex: RegExp = new RegExp(
    "\\t| *(def)\\s+\\w*\\(.*\\)(?: ?-> ?)?\\w*:$",
  );
  regexes: RegExEntry[] = [
    {
      itemId: 6700903100,
      regex: new RegExp("\\b(if)\\b.*"),
      disabled: false,
    },
    {
      itemId: 6700903101,
      regex: new RegExp("(for) .*(:)\\s*$"),
      disabled: false,
    },
    {
      itemId: 6700903102,
      regex: new RegExp("^(?:[^=]*=[^=]*)$"),
      disabled: false,
    },
    {
      itemId: 6700903103,
      regex: new RegExp(
        "(\\>=|\\<=|(?<!\\<)\\<(?!\\<)|(?<!\\>)\\>(?!\\>)|==|!=|is)",
      ),
      disabled: false,
    },
    {
      itemId: 6700903104,
      regex: new RegExp("(while) .*(:)\\s*$"),
      disabled: false,
    },
    {
      itemId: 6700903105,
      regex: new RegExp("else:\\s*$"),
      disabled: false,
    },
    {
      itemId: 6700903106,
      regex: new RegExp("elif:\\s*$"),
      disabled: false,
    },
    {
      itemId: 6700903107,
      regex: new RegExp("(match) .*(:)\\s*$"),
      disabled: false,
    },
    {
      itemId: 6700903108,
      regex: new RegExp("(\\+|\\+=)"),
      disabled: false,
    },
    {
      itemId: 6700903109,
      regex: new RegExp("(-|-=)"),
      disabled: false,
    },
    {
      itemId: 6700903110,
      regex: new RegExp("^((?:[^\\*]*\\*[^\\*]*)|\\*=)$"),
      disabled: false,
    },
    {
      itemId: 6700903111,
      regex: new RegExp("^((?:[^\\/]*\\/[^\\/]*)|(?:[^\\/]*\\/=[^=]*))$"),
      disabled: false,
    },
    {
      itemId: 6700903112,
      regex: new RegExp("(\\*\\*)"),
      disabled: false,
    },
    {
      itemId: 6700903113,
      regex: new RegExp("(\\/\\/)"),
      disabled: false,
    },
    {
      itemId: 6700903114,
      regex: new RegExp("(%)"),
      disabled: false,
    },
    {
      itemId: 6700903115,
      regex: new RegExp("( and )"),
      disabled: false,
    },
    {
      itemId: 6700903116,
      regex: new RegExp("( or )"),
      disabled: false,
    },
    {
      itemId: 6700903117,
      regex: new RegExp("( not )"),
      disabled: false,
    },
    {
      itemId: 6700903118,
      regex: new RegExp("( is )"),
      disabled: false,
    },
    {
      itemId: 6700903119,
      regex: new RegExp("( in )"),
      disabled: false,
    },
  ];

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
    return line.trimStart().indexOf("#") === 0;
  }
}

export const pythonVerifier: PythonVerifier = new PythonVerifier();

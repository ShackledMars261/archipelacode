/** @format */

import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class UniversalVerifier implements BaseLanguageVerifier {
  // A special verifier for tests that don't fall into any one language.
  langSlugs: string[] = ["misc", "universal"];
  lastGeneratedLineRegex: RegExp = new RegExp("");
  regexes: RegExEntry[] = [];

  verify(fileContents: string): [boolean, number[]] {
    return [true, []];
  }

  checkIfLineIsAComment(line: string): boolean {
    return false;
  }
}

export const universalVerifier: UniversalVerifier = new UniversalVerifier();

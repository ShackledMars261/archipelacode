/** @format */

import { BaseLanguageVerifier, RegExEntry } from "./base_lang_verifier";

class UniversalVerifier implements BaseLanguageVerifier {
  // A special verifier for tests that don't fall into any one language.
  langSlugs: string[] = ["misc", "universal"];
  regexes: RegExEntry[] = [];

  async verify(fileContents: string): Promise<boolean> {
    return true;
  }
}

export const universalVerifier: UniversalVerifier = new UniversalVerifier();

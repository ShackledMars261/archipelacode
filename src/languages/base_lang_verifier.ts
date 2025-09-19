/** @format */

export interface BaseLanguageVerifier {
  regexes: RegExEntry[];
  langSlugs: string[];
  verify(fileContents: string): Promise<boolean>;
}

export interface RegExEntry {
  regex: RegExp; // RegEx to check the code against
  itemId: number; // Archipelago Item ID needed to disable the RegEx
  disabled: boolean; // RegEx disable flag
}

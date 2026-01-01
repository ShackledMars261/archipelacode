/** @format */

export interface BaseLanguageVerifier {
  regexes: RegExEntry[];
  langSlugs: string[];
  lastGeneratedLineRegex: RegExp;
  verify(fileContents: string): [boolean, number[]];
  checkIfLineIsAComment(line: string): boolean;
}

export interface RegExEntry {
  regex: RegExp; // RegEx to check the code against
  itemId: number; // Archipelago Item ID needed to disable the RegEx
  disabled: boolean; // RegEx disable flag
}

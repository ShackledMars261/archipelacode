/** @format */
import axios from "axios";
import { globalState } from "../globalState";
import { getUrl } from "../shared";
import { parseCookie } from "../utils";

export const interpretSolution = async (
  problemSlug: string,
  questionId: number,
  lang: string,
  typedCode: string,
  dataInput: string,
) => {
  let cookie = String(globalState.getCookie());
  let cookiePairs = parseCookie(cookie);
  let referer = `https://leetcode.com/problems/${problemSlug}/`;
  let headers = {
    referer,
    ...cookiePairs,
    "x-csrftoken": cookiePairs["csrftoken"],
    cookie: cookie,
    "content-type": "application/json",
  };
  let body = JSON.stringify({
    lang: lang,
    question_id: String(questionId),
    typed_code: typedCode,
    data_input: dataInput,
  });
  let r = await axios.post(
    getUrl("interpretSolutionUrl").replace("PROBLEMSLUG", problemSlug),
    body,
    {
      headers: headers,
    },
  );
  return r.data;
};

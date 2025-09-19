/** @format */
import axios from "axios";
import { globalState } from "../globalState";
import { getUrl } from "../shared";
import { parseCookie } from "../utils";

export const checkRuncode = async (runcode: string, problemSlug: string) => {
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
  let r = await axios.get(
    getUrl("checkSolutionUrl").replace("RUNCODE", runcode),
    {
      headers: headers,
    },
  );
  return r.data;
};

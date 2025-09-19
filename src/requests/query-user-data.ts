/** @format */
import { UserDataType } from "../globalState";
import { getUrl } from "../shared";
import { APAxios } from "../utils";

const graphqlStr = `
    query globalData {
        userStatus {
            isPremium
            isVerified
            username
            avatar
            isSignedIn
        }
    }
`;

export const queryUserData = async (): Promise<UserDataType> => {
  return APAxios(getUrl("userGraphql"), {
    method: "POST",
    data: {
      query: graphqlStr,
      variables: {},
    },
  }).then((res) => res.data.data.userStatus);
};

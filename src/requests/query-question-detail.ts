/** @format */
import { getUrl, ProblemDetail } from "../shared";
import { APAxios } from "../utils";

const graphqlStr = `

    query questionDetail($titleSlug: String!) {
  languageList {
    id
    name
  }
  submittableLanguageList {
    id
    name
    verboseName
  }
  statusList {
    id
    name
  }
  questionDiscussionTopic(questionSlug: $titleSlug) {
    id
    commentCount
    topLevelCommentCount
  }
  ugcArticleOfficialSolutionArticle(questionSlug: $titleSlug) {
    uuid
    chargeType
    canSee
    hasVideoArticle
  }
  question(titleSlug: $titleSlug) {
    title
    titleSlug
    questionId
    questionFrontendId
    questionTitle
    translatedTitle
    content
    translatedContent
    categoryTitle
    difficulty
    stats
    companyTagStatsV2
    topicTags {
      name
      slug
      translatedName
    }
    similarQuestionList {
      difficulty
      titleSlug
      title
      translatedTitle
      isPaidOnly
    }
    mysqlSchemas
    dataSchemas
    frontendPreviews
    likes
    dislikes
    isPaidOnly
    status
    canSeeQuestion
    enableTestMode
    metaData
    enableRunCode
    enableSubmit
    enableDebugger
    envInfo
    isLiked
    nextChallenges {
      difficulty
      title
      titleSlug
      questionFrontendId
    }
    libraryUrl
    adminUrl
    hints
    codeSnippets {
      code
      lang
      langSlug
    }
    exampleTestcaseList
    hasFrontendPreview
    featuredContests {
      titleSlug
      title
    }
  }
}
    
`;

export const queryQuestionDetail = async (
  titleSlug: string,
): Promise<ProblemDetail> => {
  return APAxios(getUrl("userGraphql"), {
    method: "POST",
    data: {
      query: graphqlStr,
      variables: {
        titleSlug: titleSlug,
      },
    },
  }).then((res) => res.data.data.question);
};

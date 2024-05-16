import { type LabelData } from "@pages/content/drawLabels";
import OpenAI from "openai";
import { useAppState } from "../../state/store";
import { allToolsDescriptions } from "./tools";
import { type Knowledge } from "../knowledge";
import errorChecker from "../errorChecker";
import { fetchResponseFromModel } from "../aiSdkUtils";
import { type Action, parseResponse } from "./parseResponse";

const systemMessage = (voiceMode: boolean) => `
You are a browser automation assistant.

You can use the following tools:

${allToolsDescriptions}

You will be given a task to perform, and an image. The image will contain two parts: on the left is a clean screenshot of the current page, and on the right is the same screenshot with interactive elements annotated with corresponding label.
You will also be given previous actions that you have taken. If something does not work, try find an alternative solution. For example, instead of searching for a specific item that the user requested, perform a general search and apply filters, or simply browse the results page.
You will also be given additional information of annotations.

This is one example of expected response from you:

{
  "thought": "I am clicking the add to cart button",${
    voiceMode
      ? `
  "speak": "I am clicking the add to cart button",`
      : ""
  }
  "action": {
    "name": "click",
    "args": {
      "label": "123"
    }
  }
}

If the given task asks for the current website content, ${
  voiceMode ? "speak" : "thought"
} string should contain the description of the current website content.
For example:
${
  voiceMode
    ? `
{
  "thought": "I am reading the tweets visible on the screen.",
  "speak": "Here is one tweet currently visible on the screen: The tweet is by Normal Computing, who posted about open sourcing Fuji-Web with a screenshot of the Fuji-Web github repository. The tweet has 10 replies, 100 retweets, and 1000 likes.",
  "action": {
    "name": "finish",
  }
}
`
    : `
{
  "thought": "Here is one tweet currently visible on the screen: The tweet is by Normal Computing, who posted about open sourcing Fuji-Web with a screenshot of the Fuji-Web github repository. The tweet has 10 replies, 100 retweets, and 1000 likes.",
  "action": {
    "name": "finish",
  }
}
`
}

If a task requires searching and if the first searching attempt does not lead to ideal results, try again with a more general search query.

Your response must always be in JSON format and must include string "thought"${
  voiceMode ? ', string "speak",' : ""
} and object "action", which contains the string "name" of tool of choice, and necessary arguments ("args") if required by the tool.
When finish, use the "finish" action and include a brief summary of the task in "thought"; if user is seeking an answer, also include the answer in "thought".
`;

export type QueryResult = {
  usage: OpenAI.CompletionUsage | undefined;
  prompt: string;
  rawResponse: string;
  action: Action;
} | null;

export async function determineNextActionWithVision(
  taskInstructions: string,
  url: URL,
  knowledge: Knowledge,
  previousActions: Action[],
  screenshotData: string,
  labelData: LabelData[],
  viewportPercentage: number,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
): Promise<QueryResult> {
  const model = useAppState.getState().settings.selectedModel;
  const voiceMode = useAppState.getState().settings.voiceMode;
  const prompt = formatPrompt(
    taskInstructions,
    previousActions,
    url,
    knowledge,
    labelData,
    viewportPercentage,
  );

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await fetchResponseFromModel(model, {
        systemMessage: systemMessage(voiceMode),
        prompt,
        imageData: screenshotData,
        jsonMode: true,
      });

      const rawResponse = completion.rawResponse;
      let action = null;
      try {
        action = parseResponse(rawResponse);
      } catch (e) {
        console.error(e);
        // TODO: try use LLM to fix format when response is not valid
        throw new Error(`Incorrectly formatted response: ${e}`);
      }

      return {
        usage: completion.usage,
        prompt,
        rawResponse,
        action,
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (error instanceof Error) {
        const recoverable = errorChecker(error, notifyError);
        if (!recoverable) {
          throw error;
        }
      } else {
        console.error("Unexpected determineNextAction error:");
        console.error(error);
      }
    }
  }
  const errMsg = `Failed to complete query after ${maxAttempts} attempts. Please try again later.`;
  if (notifyError) {
    notifyError(errMsg);
  }
  throw new Error(errMsg);
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: Action[],
  url: URL,
  knowledge: Knowledge,
  labelData: LabelData[],
  viewportPercentage: number,
) {
  // 1. task instructions
  let result = `The user requests the following task:

  ${taskInstructions}`;

  // 2. previous actions
  let previousActionsString = "";
  if (previousActions.length > 0) {
    const serializedActions = previousActions
      .map(
        (action) =>
          `Thought: ${action.thought}\nAction:${JSON.stringify(
            action.operation,
          )}`,
      )
      .join("\n\n");
    previousActionsString = `You have already taken the following actions: \n${serializedActions}\n\n`;
  }
  result += `\n${previousActionsString}\n`;

  // 3. current time + current URL + current page scrolling position
  let urlString = url.href;
  // do not include search if it's too long
  if (url.search.length > 100) {
    urlString = url.origin + url.pathname;
  }
  result += `
Current time: ${new Date().toLocaleString()}
Current URL: ${urlString}
Current page scrolling position: ${viewportPercentage.toFixed(1)}%
`;

  // 4. knowledge
  if (knowledge.notes != null && knowledge.notes?.length > 0) {
    result += `
Notes regarding the current website:
${knowledge.notes.map((k) => `  - ${k}`).join("\n")}`;
  }

  // 5. label data from HTML
  result += `

Use the following data as a reference of the annotated elements (using \`===\` as a delimiter between each annotation):

${labelData.map((item) => tomlLikeStringifyObject(item)).join("\n===\n")}
`;
  // 6. active element
  const currentActiveItem = labelData.find((item) => item.active);
  if (currentActiveItem != null) {
    result += `
This ${currentActiveItem.tagName.toLocaleLowerCase()} currently has focus:
${tomlLikeStringifyObject(currentActiveItem)}
`;
  }
  return result;
}

function tomlLikeStringifyObject(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) =>
      // only include string values
      typeof value === "string" ? `${key} = ${value}` : null,
    )
    .filter((v) => v != null)
    .join("\n");
}

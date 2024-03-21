import { type LabelData } from "@pages/content/drawLabels";
import OpenAI from "openai";
import { useAppState } from "../../state/store";
import {
  allToolsDescriptions,
  toolSchemaUnion,
  type ToolOperation,
} from "./tools";
import { type Knowledge } from "../knowledge";
import errorChecker from "../errorChecker";

const visionSystemMessage = `
You are a browser automation assistant.

You can use the following tools:

${allToolsDescriptions}

You will be given a task to perform, and an image. The image will contain two parts: on the left is a clean screenshot of the current page, and on the right is the same screenshot with interactive elements annotated with corresponding label.
You will also be given previous actions that you have taken. You may retry a failed action up to one time.
You will also be given additional information of annotations.

This is an example of expected response from you:

{
  "thought": "I am clicking the add to cart button",
  "action": {
    "name": "click",
    "args": {
      "label": "123"
    }
  }
}

Your response must always be in JSON format and must include string "thought" and object "action", which contains the string "name" of tool of choice, and necessary arguments ("args") if required by the tool.
When finish, use the "finish" action and include a brief summary of the task in "thought"; if user is seeking an answer, also include the answer in "thought".
`;

export type QueryResult = {
  usage: OpenAI.CompletionUsage | undefined;
  prompt: string;
  rawResponse: string;
  action: Action;
} | null;

export type Action = {
  thought: string;
  operation: ToolOperation;
};

export async function determineNextActionWithVision(
  taskInstructions: string,
  knowledge: Knowledge,
  previousActions: Action[],
  screenshotData: string,
  labelData: LabelData[],
  viewportPercentage: number,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
): Promise<QueryResult> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.("No OpenAI key found");
    return null;
  }
  const model = useAppState.getState().settings.selectedModel;
  let prompt =
    formatPrompt(taskInstructions, previousActions) +
    `Current page progress: ${viewportPercentage.toFixed(1)}%`;
  if (knowledge.notes != null && knowledge.notes?.length > 0) {
    prompt += `
    Notes regarding the current website:
    ${knowledge.notes.map((k) => `  - ${k}`).join("\n")}`;
  }
  prompt += `

Use the following data as a reference of the annotated elements (using \`===\` as a delimiter between each annotation):

${labelData.map((item) => tomlLikeStringifyObject(item)).join("\n===\n")}`;

  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true, // user provides the key
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        // does not work for vision model yet
        // response_format: {
        //   type: 'json_object',
        // },
        messages: [
          {
            role: "system",
            content: visionSystemMessage,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
              },
              {
                type: "image_url",
                image_url: {
                  // detail: 'low',
                  url: screenshotData, // this is already base64 encoded
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0,
      });

      const rawResponse = completion.choices[0].message?.content?.trim() ?? "";
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
        errorChecker(error, notifyError);
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
) {
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

  const result = `The user requests the following task:

${taskInstructions}

${previousActionsString}

Current time: ${new Date().toLocaleString()}
`;
  return result;
}

function tomlLikeStringifyObject(obj: Record<string, unknown>): string {
  return Object.entries(obj)
    .map(([key, value]) => `${key} = ${JSON.stringify(value)}`)
    .join("\n");
}

// sometimes AI replies with a JSON wrapped in triple backticks
export function extractJsonFromMarkdown(input: string): string[] {
  // Create a regular expression to capture code wrapped in triple backticks
  const regex = /```(json)?\s*([\s\S]*?)\s*```/g;

  const results = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    // If 'json' is specified, add the content to the results array
    if (match[1] === "json") {
      results.push(match[2]);
    } else if (match[2].startsWith("{")) {
      results.push(match[2]);
    }
  }
  return results;
}

export function parseResponse(rawResponse: string): Action {
  let response;
  try {
    response = JSON.parse(rawResponse);
  } catch (_e) {
    try {
      response = JSON.parse(extractJsonFromMarkdown(rawResponse)[0]);
    } catch (_e) {
      throw new Error("Response does not contain valid JSON.");
    }
  }
  if (response.thought == null || response.action == null) {
    throw new Error("Invalid response: Thought and Action are required");
  }
  const operation = toolSchemaUnion.parse(response.action);
  return {
    thought: response.thought,
    operation,
  };
}
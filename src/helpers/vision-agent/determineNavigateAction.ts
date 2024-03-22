import OpenAI from "openai";
import { parseResponse } from "./parseResponse";
import { QueryResult } from "./determineNextAction";
import { useAppState } from "../../state/store";
import errorChecker from "../errorChecker";

import { schemaToDescription, navigateSchema } from "./tools";

const navigateSchemaDescription = schemaToDescription(navigateSchema);

const systemMessage = `
You are a browser automation assistant.

You can use the following tool:

${navigateSchemaDescription}

You will be given a task to perform.
This is an example of expected response from you:

{
  "thought": "To find latest news on AI, I am navigating to Google.",
  "action": {
    "name": "navigate",
    "args": {
      "url": "https://www.google.com/"
    }
  }
}

Your response must always be in JSON format and must include string "thought" and object "action", which contains the string "name" of tool of choice, and necessary arguments ("args") if required by the tool.
`;

export async function determineNavigateAction(
  taskInstructions: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
): Promise<QueryResult> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.("No OpenAI key found");
    return null;
  }
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions);

  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true, // user provides the key
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          {
            role: "user",
            content: [
              {
                type: "text",
                text: prompt,
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

export function formatPrompt(taskInstructions: string) {
  return `The user requests the following task:

${taskInstructions}

Current time: ${new Date().toLocaleString()}
`;
}
import OpenAI from "openai";
import { useAppState } from "../../state/store";
import { availableActions } from "./availableActions";
import { ParsedResponseSuccess, parseResponse } from "./parseResponse";
import {
  Action as VisionAction,
  QueryResult,
} from "../vision-agent/determineNextAction";
import errorChecker from "../errorChecker";

const formattedActions = availableActions
  .map((action, i) => {
    const args = action.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(", ");
    return `${i + 1}. ${action.name}(${args}): ${action.description}`;
  })
  .join("\n");

const systemMessage = `
You are a browser automation assistant.

You can use the following tools:

${formattedActions}

You will be given a task to perform and the current state of the DOM.
You will also be given previous actions that you have taken. You may retry a failed action up to one time.

There are two examples of actions:

Example 1:
{
  thought: "I am clicking the add to cart button",
  action: "click(223)"
}

Example 2:
{
  thought: "I continue to scroll down to find the section",
  action: "scroll("down")"
}

Your response must always be in JSON format and must include "thought" and "action".
When finish, use "finish()" in "action" and include a brief summary of the task in "thought".
`;

export async function determineNextAction(
  taskInstructions: string,
  previousActions: VisionAction[],
  simplifiedDOM: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void,
): Promise<QueryResult> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.("No OpenAI key found");
    return null;
  }
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions, previousActions, simplifiedDOM);

  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true, // user provides the key
  });

  for (let i = 0; i < maxAttempts; i++) {
    try {
      const completion = await openai.chat.completions.create({
        model: model,
        // response_format: {
        //   type: 'json_object',
        // },
        messages: [
          {
            role: "system",
            content: systemMessage,
          },
          { role: "user", content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0,
      });

      const rawResponse = completion.choices[0].message?.content?.trim() || "";
      try {
        const parsed = await parseResponse(rawResponse);
        if ("error" in parsed) {
          throw new Error(parsed.error);
        }
        return {
          usage: completion.usage,
          prompt,
          rawResponse,
          action: visionActionAdapter(parsed),
        };
      } catch (e) {
        console.error("Failed to parse response", e);
      }
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
  previousActions: VisionAction[],
  pageContents?: string,
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

  let result = `The user requests the following task:

${taskInstructions}

${previousActionsString}

Current time: ${new Date().toLocaleString()}
`;
  if (pageContents) {
    result += `
Current page contents:
${pageContents}`;
  }
  return result;
}

function visionActionAdapter(action: ParsedResponseSuccess): VisionAction {
  const args = { ...action.parsedAction.args, label: "" };
  if ("elementId" in args) {
    args.label = args.elementId;
  }
  return {
    thought: action.thought,
    operation: {
      name: action.parsedAction.name,
      args,
    } as VisionAction["operation"],
  };
}

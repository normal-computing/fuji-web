import OpenAI from 'openai';
import { useAppState } from '../state/store';
import { availableActions } from './availableActions';
import { ParsedResponseSuccess } from './parseResponse';

const formattedActions = availableActions
  .map((action, i) => {
    const args = action.args
      .map((arg) => `${arg.name}: ${arg.type}`)
      .join(', ');
    return `${i + 1}. ${action.name}(${args}): ${action.description}`;
  })
  .join('\n');

const systemMessage = `
You are a browser automation assistant.

You can use the following tools:

${formattedActions}

You will be be given a task to perform and the current state of the DOM. You will also be given previous actions that you have taken. You may retry a failed action up to one time.

This is an example of an action:

{
  thought: "I should click the add to cart button",
  action: "click(223)"
}

Your response must always be in JSON format and must include "thought" and "action"`;

const visionSystemMessage = `
You are a browser automation assistant.

You can use the following tools:

${formattedActions}

You will be be given a task to perform and a screenshot of the webpage. You will also be given previous actions that you have taken. You may retry a failed action up to one time.

This is an example of an action:

{
  thought: "I should click the add to cart button",
  action: "click('add to cart')"
}

Your response must always be in JSON format and must include "thought" and "action"`;

export type NextAction = {
  usage: OpenAI.CompletionUsage | undefined;
  prompt: string;
  response: string;
} | null;

export async function determineNextActionWithVision(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  screenshotData: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void
): Promise<NextAction> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.('No OpenAI key found');
    return null;
  }
  const model = useAppState.getState().settings.selectedModel;
  const prompt = formatPrompt(taskInstructions, previousActions);

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
            role: 'system',
            content: visionSystemMessage,
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: prompt,
              },
              {
                type: 'image_url',
                image_url: {
                  url: screenshotData, // this is already base64 encoded
                },
              },
            ],
          },
        ],
        max_tokens: 1000,
        temperature: 0,
      });

      return {
        usage: completion.usage,
        prompt,
        response: completion.choices[0].message?.content?.trim() || '',
      };
    } catch (error: any) {
      // TODO: need to verify the new API error format
      console.error('determineNextAction error:');
      console.error(error);
      if (error.includes('server error')) {
        // Problem with the OpenAI API, try again
        if (notifyError) {
          notifyError(error);
        }
      } else {
        // Another error, give up
        throw new Error(error);
      }
    }
  }
  throw new Error(
    `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
  );
}

export async function determineNextAction(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  simplifiedDOM: string,
  maxAttempts = 3,
  notifyError?: (error: string) => void
): Promise<NextAction> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    notifyError?.('No OpenAI key found');
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
            role: 'system',
            content: systemMessage,
          },
          { role: 'user', content: prompt },
        ],
        max_tokens: 1000,
        temperature: 0,
      });

      return {
        usage: completion.usage,
        prompt,
        response: completion.choices[0].message?.content?.trim() || '',
      };
    } catch (error: any) {
      // TODO: need to verify the new API error format
      console.error('determineNextAction error:');
      console.error(error);
      if (error.includes('server error')) {
        // Problem with the OpenAI API, try again
        if (notifyError) {
          notifyError(error);
        }
      } else {
        // Another error, give up
        throw new Error(error);
      }
    }
  }
  throw new Error(
    `Failed to complete query after ${maxAttempts} attempts. Please try again later.`
  );
}

export function formatPrompt(
  taskInstructions: string,
  previousActions: ParsedResponseSuccess[],
  pageContents?: string
) {
  let previousActionsString = '';

  if (previousActions.length > 0) {
    const serializedActions = previousActions
      .map((action) => `Thought: ${action.thought}\nAction:${action.action}`)
      .join('\n\n');
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

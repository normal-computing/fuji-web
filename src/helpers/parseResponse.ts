import { ActionPayload, availableActions } from './availableActions';

export type ParsedResponseSuccess = {
  thought: string;
  action: string;
  parsedAction: ActionPayload;
};

export type ParsedResponse =
  | ParsedResponseSuccess
  | {
      error: string;
    };

// sometimes AI replies with a JSON wrapped in triple backticks
export function extractJsonFromMarkdown(input: string): string[] {
  // Create a regular expression to capture code wrapped in triple backticks
  const regex = /```(json)?\s*([\s\S]*?)\s*```/g;

  const results = [];
  let match;
  while ((match = regex.exec(input)) !== null) {
    // If 'json' is specified, add the content to the results array
    if (match[1] === 'json') {
      results.push(match[2]);
    } else if (match[2].startsWith('{')) {
      results.push(match[2]);
    }
  }
  return results;
}

export function parseResponse(text: string): ParsedResponse {
  let action;
  try {
    action = JSON.parse(text);
  } catch (_e) {
    try {
      action = JSON.parse(extractJsonFromMarkdown(text)[0]);
    } catch (_e) {
      throw new Error('Response does not contain valid JSON.');
    }
  }

  if (!action.thought) {
    return {
      error: 'Invalid response: Thought not found in the model response.',
    };
  }

  if (!action.action) {
    return {
      error: 'Invalid response: Action not found in the model response.',
    };
  }

  const thought = action.thought;
  const actionString = action.action;
  const actionPattern = /(\w+)\((.*?)\)/;
  const actionParts = actionString.match(actionPattern);

  if (!actionParts) {
    return {
      error:
        'Invalid action format: Action should be in the format functionName(arg1, arg2, ...).',
    };
  }

  const actionName = actionParts[1];
  const actionArgsString = actionParts[2];

  const availableAction = availableActions.find(
    (action) => action.name === actionName
  );

  if (!availableAction) {
    return {
      error: `Invalid action: "${actionName}" is not a valid action.`,
    };
  }

  const argsArray = actionArgsString
    .split(',')
    .map((arg: string) => arg.trim())
    .filter((arg: string) => arg !== '');
  const parsedArgs: Record<string, number | string> = {};

  if (argsArray.length !== availableAction.args.length) {
    return {
      error: `Invalid number of arguments: Expected ${availableAction.args.length} for action "${actionName}", but got ${argsArray.length}.`,
    };
  }

  for (let i = 0; i < argsArray.length; i++) {
    const arg = argsArray[i];
    const expectedArg = availableAction.args[i];

    if (expectedArg.type === 'number') {
      const numberValue = Number(arg);

      if (isNaN(numberValue)) {
        return {
          error: `Invalid argument type: Expected a number for argument "${expectedArg.name}", but got "${arg}".`,
        };
      }

      parsedArgs[expectedArg.name] = numberValue;
    } else if (expectedArg.type === 'string') {
      const stringValue =
        (arg.startsWith('"') && arg.endsWith('"')) ||
        (arg.startsWith("'") && arg.endsWith("'")) ||
        (arg.startsWith('`') && arg.endsWith('`'))
          ? arg.slice(1, -1)
          : null;

      if (stringValue === null) {
        return {
          error: `Invalid argument type: Expected a string for argument "${expectedArg.name}", but got "${arg}".`,
        };
      }

      parsedArgs[expectedArg.name] = stringValue;
    } else {
      return {
        // @ts-expect-error this is here to make sure we don't forget to update this code if we add a new arg type
        error: `Invalid argument type: Unknown type "${expectedArg.type}" for argument "${expectedArg.name}".`,
      };
    }
  }

  const parsedAction = {
    name: availableAction.name,
    args: parsedArgs,
  } as ActionPayload;

  return {
    thought,
    action: actionString,
    parsedAction,
  };
}

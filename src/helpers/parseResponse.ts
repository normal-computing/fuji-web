import {
  ActionPayload,
  availableActions,
  availableActionsVision,
} from "./availableActions";

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
    if (match[1] === "json") {
      results.push(match[2]);
    } else if (match[2].startsWith("{")) {
      results.push(match[2]);
    }
  }
  return results;
}

function parseFunctionCall(callString: string) {
  // First, match the function name and the arguments part
  const functionPattern = /(\w+)\(([\s\S]*)\)/;
  const matches = callString.match(functionPattern);

  if (!matches) {
    console.error("Input does not match a function call pattern.", callString);
    throw new Error("Input does not match a function call pattern.");
  }

  const [, name, argsPart] = matches;

  // Then, match the arguments inside the args part
  // This pattern looks for either strings (handling escaped quotes) or numbers as arguments
  const argsPattern = /(["'])(?:(?=(\\?))\2[\s\S])*?\1|\d+/g;
  const argsMatches = argsPart.match(argsPattern);

  // Process matched arguments to strip quotes and unescape characters
  const args = argsMatches
    ? argsMatches.map((arg: string) => {
        // Remove leading and trailing quotes if they exist and unescape characters
        if (
          (arg.startsWith(`"`) && arg.endsWith(`"`)) ||
          (arg.startsWith(`'`) && arg.endsWith(`'`))
        ) {
          arg = arg.slice(1, -1);
          return arg
            .replace(/\\'/g, `'`)
            .replace(/\\"/g, `"`)
            .replace(/\\\\/g, `\\`);
        }
        // Parse numbers directly
        return JSON.parse(arg);
      })
    : [];

  return { name, args };
}

export function parseResponse(
  text: string,
  isVisionModel: boolean,
): ParsedResponse {
  let action;
  try {
    action = JSON.parse(text);
  } catch (_e) {
    try {
      action = JSON.parse(extractJsonFromMarkdown(text)[0]);
    } catch (_e) {
      throw new Error("Response does not contain valid JSON.");
    }
  }

  if (!action.thought) {
    return {
      error: "Invalid response: Thought not found in the model response.",
    };
  }

  if (!action.action) {
    return {
      error: "Invalid response: Action not found in the model response.",
    };
  }

  const thought = action.thought;
  const actionString = action.action;

  const { name: actionName, args: argsArray } = parseFunctionCall(actionString);
  console.log(actionName, argsArray);

  let availableAction = null;
  if (isVisionModel) {
    availableAction = availableActionsVision.find(
      (action) => action.name === actionName,
    );
  } else {
    availableAction = availableActions.find(
      (action) => action.name === actionName,
    );
  }

  if (!availableAction) {
    return {
      error: `Invalid action: "${actionName}" is not a valid action.`,
    };
  }
  const parsedArgs: Record<string, number | string> = {};

  if (argsArray.length !== availableAction.args.length) {
    return {
      error: `Invalid number of arguments: Expected ${availableAction.args.length} for action "${actionName}", but got ${argsArray.length}.`,
    };
  }

  for (let i = 0; i < argsArray.length; i++) {
    const arg = argsArray[i];
    const expectedArg = availableAction.args[i];

    parsedArgs[expectedArg.name] = arg;

    // TODO: type-parsing is currently disabled because all our args are strings
    // if (expectedArg.type === 'number') {
    //   const numberValue = Number(arg);

    //   if (isNaN(numberValue)) {
    //     return {
    //       error: `Invalid argument type: Expected a number for argument "${expectedArg.name}", but got "${arg}".`,
    //     };
    //   }

    //   parsedArgs[expectedArg.name] = numberValue;
    // } else if (expectedArg.type === 'string') {
    //   parsedArgs[expectedArg.name] = arg;
    // } else {
    //   return {
    //     // @ts-expect-error this is here to make sure we don't forget to update this code if we add a new arg type
    //     error: `Invalid argument type: Unknown type "${expectedArg.type}" for argument "${expectedArg.name}".`,
    //   };
    // }
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

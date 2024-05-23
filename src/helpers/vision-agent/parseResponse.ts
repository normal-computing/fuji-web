import { toolSchemaUnion, type ToolOperation } from "./tools";
import { fromError } from "zod-validation-error";

export type Action = {
  thought: string;
  speak?: string;
  operation: ToolOperation;
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
  let operation;
  try {
    operation = toolSchemaUnion.parse(response.action);
  } catch (err) {
    const validationError = fromError(err);
    // user friendly error message
    throw new Error(validationError.toString());
  }
  if ("speak" in response) {
    return {
      thought: response.thought,
      speak: response.speak,
      operation,
    };
  } else {
    return {
      thought: response.thought,
      operation,
    };
  }
}

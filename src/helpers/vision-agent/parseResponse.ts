import { toolSchemaUnion, type ToolOperation } from "./tools";

export type Action = {
  thought: string;
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
  const operation = toolSchemaUnion.parse(response.action);
  return {
    thought: response.thought,
    operation,
  };
}

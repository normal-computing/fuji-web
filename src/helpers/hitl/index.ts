import { useAppState } from "../../state/store";
import { fetchResponseFromModel } from "../aiSdkUtils";
import { QueryResult } from "../vision-agent/determineNextAction";
import { Action } from "../vision-agent/parseResponse";

const systemMessage = `
You are an oversight system for a browser automation assistant.

You will receive a JSON with two fields:
  hitl_rule: a rule that describes what kind of actions require human approval before execution. These actions trigger a safety checkpoint.
  action: a JSON describing an action that the assistant intends to execute.
  previous_actions: an array of previous actions that have been performed, so that you understand what's happening in the current one.

You will be asked to determine if the assistant's intended action falls within the scope of actions described by the rule.
For the action to trigger the rule, the action must fall precisely within the rule's scope.
If the action is just leading up to an action requiring approval, it does not require approval itself.

If the action falls within the scope of the rule, then they require human approval and you should respond with "true".
If it does not, then they do not require human approval and you should respond with "false".

You response will be strictly "true" or "false". It will not contain any further text, including any additional context or explanation.
`;

export type CheckpointRule = {
  id: string;
  description: string;
};

export function hasCheckpointRules(): boolean {
  const store = useAppState.getState();
  return store.settings.hitlRules.length > 0;
}

// TODO: remove console logs
export async function matchesCheckpointRule(
  query: QueryResult,
  previousActions: Action[],
): Promise<boolean> {
  // If no rules defined, don't require approval
  if (!hasCheckpointRules()) {
    return false;
  }
  console.log("Checking checkpoint rules...");
  const store = useAppState.getState();
  const rules = store.settings.hitlRules;
  console.log("Rules: ", rules);

  const rawResponse = query?.rawResponse;

  for (const rule of rules) {
    const prompt = JSON.stringify(
      {
        hitl_rule: rule.description,
        action: rawResponse,
        previous_actions: previousActions.map((action) => action.thought),
      },
      null,
      2,
    );
    console.log("Prompt: ", prompt);
    const model = useAppState.getState().settings.selectedModel;

    const completion = await fetchResponseFromModel(model, {
      systemMessage: systemMessage,
      prompt,
      jsonMode: false,
    });
    console.log("Completion: ", completion);

    const needsApproval = completion.rawResponse.toLowerCase() === "true";
    if (needsApproval) {
      return true;
    }
  }

  // If no rules matched, don't require approval
  return false;
}

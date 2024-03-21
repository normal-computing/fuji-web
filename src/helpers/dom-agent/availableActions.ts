// TODO: refactor such that it only has one "availableActions"
// which dynamically decides whether it's "label" or "elementId" based on the model type

const commonActions = [
  {
    name: "scroll",
    description:
      'Scroll the page to see the other parts. Use "up" or "down" to scroll half the height of the window. Use "top" or "bottom" to quickly scroll to the top or bottom of the page.',
    args: [
      {
        name: "value",
        type: "string",
      },
    ],
  },
  {
    name: "wait",
    description:
      "Wait for 3 seconds before the next action. Useful when the page is loading.",
    args: [],
  },
  {
    name: "finish",
    description: "Indicates the task is finished",
    args: [],
  },
  {
    name: "fail",
    description: "Indicates that you are unable to complete the task",
    args: [],
  },
] as const;

export const availableActionsVision = [
  {
    name: "click",
    description: "Click on an element with the label on the annotation.",
    args: [
      {
        name: "label",
        type: "string",
      },
    ],
  },
  {
    name: "setValue",
    description:
      "Focus on and set the value of an input element with the label on the annotation.",
    args: [
      {
        name: "label",
        type: "string",
      },
      {
        name: "value",
        type: "string",
      },
    ],
  },
  ...commonActions,
] as const;

export const availableActions = [
  {
    name: "click",
    description: "Clicks on an element",
    args: [
      {
        name: "elementId",
        type: "string",
      },
    ],
  },
  {
    name: "setValue",
    description: "Focuses on and sets the value of an input element",
    args: [
      {
        name: "elementId",
        type: "string",
      },
      {
        name: "value",
        type: "string",
      },
    ],
  },
  ...commonActions,
] as const;

type AvailableActionVision = (typeof availableActionsVision)[number];
type AvailableAction = (typeof availableActions)[number];

type ArgsToObject<T extends ReadonlyArray<{ name: string; type: string }>> = {
  [K in T[number]["name"]]: Extract<
    T[number],
    { name: K }
  >["type"] extends "number"
    ? number
    : string;
};

export type ActionShape<
  T extends {
    name: string;
    args: ReadonlyArray<{ name: string; type: string }>;
  },
> = {
  name: T["name"];
  args: ArgsToObject<T["args"]>;
};

export type ActionPayloadVision = {
  [K in AvailableAction["name"]]: ActionShape<
    Extract<AvailableAction, { name: K }>
  >;
}[AvailableActionVision["name"]];

export type ActionPayload = {
  [K in AvailableAction["name"]]: ActionShape<
    Extract<AvailableAction, { name: K }>
  >;
}[AvailableAction["name"]];

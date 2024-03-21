const commonActions = [
  {
    name: "wait",
    description:
      "Wait for 3 seconds before the next action. Useful when the page is loading.",
    args: [],
  },
  {
    name: "finish",
    description: "Indicate the task is finished",
    args: [],
  },
  {
    name: "fail",
    description: "Indicate that you are unable to complete the task",
    args: [],
  },
] as const;

export const availableActions = [
  {
    name: "click",
    description: "Click on an element",
    args: [
      {
        name: "elementId",
        type: "string",
      },
    ],
  },
  {
    name: "setValue",
    description: "Focus on and sets the value of an input element",
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

export type ActionPayload = {
  [K in AvailableAction["name"]]: ActionShape<
    Extract<AvailableAction, { name: K }>
  >;
}[AvailableAction["name"]];

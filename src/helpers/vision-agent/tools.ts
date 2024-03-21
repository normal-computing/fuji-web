import { z } from "zod";

export const clickSchema = z.object({
  name: z.literal("click"),
  description: z
    .literal("Click on an element with the label on the annotation.")
    .optional(),
  args: z.object({
    label: z.string(),
  }),
});

export const setValueSchema = z.object({
  name: z.literal("setValue"),
  description: z
    .literal(
      "Focus on and set the value of an input element with the label on the annotation.",
    )
    .optional(),
  args: z.object({
    label: z.string(),
    value: z.string(),
  }),
});

export const scrollSchema = z.object({
  name: z.literal("scroll"),
  description: z
    .literal(
      'Scroll the page to see the other parts. Use "up" or "down" to scroll half the height of the window. Use "top" or "bottom" to quickly scroll to the top or bottom of the page.',
    )
    .optional(),
  args: z.object({
    value: z.string(),
  }),
});

export const waitSchema = z.object({
  name: z.literal("wait"),
  description: z
    .literal(
      "Wait for 3 seconds before the next action. Useful when the page is loading.",
    )
    .optional(),
  args: z.object({}),
});

export const finishSchema = z.object({
  name: z.literal("finish"),
  description: z.literal("Indicate the task is finished").optional(),
  args: z.object({}).optional(),
});

export const failSchema = z.object({
  name: z.literal("fail"),
  description: z
    .literal("Indicate that you are unable to complete the task")
    .optional(),
  args: z.object({}).optional(),
});

export const toolSchemaUnion = z.discriminatedUnion("name", [
  clickSchema,
  setValueSchema,
  scrollSchema,
  waitSchema,
  finishSchema,
  failSchema,
]);
const allTools = toolSchemaUnion.options;
type ToolSchema = (typeof allTools)[number];

export type ToolOperation = z.infer<typeof toolSchemaUnion>;

export function schemaToDescription(schema: ToolSchema): string {
  let description = "";
  const shape = schema.shape;
  const name = shape.name._def.value;
  const descriptionText = shape.description.unwrap()._def.value;
  description += `Name: ${name}\nDescription: ${descriptionText}\n`;

  const args = shape.args;
  // If the tool has arguments, list them. If entire args is ZodOptional, there are no arguments.
  if (args instanceof z.ZodObject && Object.keys(args.shape).length > 0) {
    description += "Arguments:\n";
    Object.entries(args.shape).forEach(([key, value]) => {
      const argType = value instanceof z.ZodString ? "string" : "unknown";
      description += `  - ${key} (${argType})\n`;
    });
  } else {
    description += "No arguments.\n";
  }

  return description;
}

function getAllToolsDescriptions(): string {
  return allTools.map(schemaToDescription).join("\n");
}
export const allToolsDescriptions = getAllToolsDescriptions();

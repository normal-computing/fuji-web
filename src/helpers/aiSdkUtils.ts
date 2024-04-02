import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { useAppState } from "../state/store";

export enum SupportedModels {
  Gpt35Turbo16k = "gpt-3.5-turbo-16k",
  Gpt4 = "gpt-4",
  Gpt4TurboPreview = "gpt-4-turbo-preview",
  Gpt4VisionPreview = "gpt-4-vision-preview",
  Claude3Sonnet = "claude-3-sonnet-20240229",
}

export const DisplayName = {
  [SupportedModels.Gpt35Turbo16k]: "GPT-3.5 Turbo (16k)",
  [SupportedModels.Gpt4]: "GPT-4",
  [SupportedModels.Gpt4TurboPreview]: "GPT-4 Turbo (Preview)",
  [SupportedModels.Gpt4VisionPreview]: "GPT-4 Vision (Preview)",
  [SupportedModels.Claude3Sonnet]: "Claude 3 Sonnet",
};

export function hasVisionSupport(model: SupportedModels) {
  console.log(model, SupportedModels.Gpt4VisionPreview);
  return (
    model === SupportedModels.Gpt4VisionPreview ||
    model === SupportedModels.Claude3Sonnet
  );
}

export type SDKChoice = "OpenAI" | "Anthropic";

function chooseSDK(model: SupportedModels): SDKChoice {
  if (model.startsWith("claude")) {
    return "Anthropic";
  }
  return "OpenAI";
}

export function isOpenAIModel(model: SupportedModels) {
  return chooseSDK(model) === "OpenAI";
}
export function isAnthropicModel(model: SupportedModels) {
  return chooseSDK(model) === "Anthropic";
}

export type CommonMessageCreateParams = {
  prompt: string;
  imageData?: string;
  systemMessage?: string;
  jsonMode?: boolean;
};

export type Response = {
  usage: OpenAI.CompletionUsage | undefined;
  rawResponse: string;
};

export async function fetchResponseFromModelOpenAI(
  model: SupportedModels,
  params: CommonMessageCreateParams,
): Promise<Response> {
  const key = useAppState.getState().settings.openAIKey;
  if (!key) {
    throw new Error("No OpenAI key found");
  }
  const openai = new OpenAI({
    apiKey: key,
    dangerouslyAllowBrowser: true, // user provides the key
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (params.systemMessage != null) {
    messages.push({
      role: "system",
      content: params.systemMessage,
    });
  }
  const content: OpenAI.ChatCompletionContentPart[] = [
    {
      type: "text",
      text: params.prompt,
    },
  ];
  if (params.imageData != null) {
    content.push({
      type: "image_url",
      image_url: {
        url: params.imageData,
      },
    });
  }
  messages.push({
    role: "user",
    content,
  });
  // this trick does not work for GPT-4
  // if (params.jsonMode) {
  //   messages.push({
  //     role: "assistant",
  //     content: "{",
  //   });
  // }
  const completion = await openai.chat.completions.create({
    model: model,
    messages,
    max_tokens: 1000,
    temperature: 0,
  });
  const rawResponse = completion.choices[0].message?.content?.trim() ?? "";
  return {
    usage: completion.usage,
    rawResponse,
  };
}

export async function fetchResponseFromModelAnthropic(
  model: SupportedModels,
  params: CommonMessageCreateParams,
): Promise<Response> {
  const key = useAppState.getState().settings.anthropicKey;
  if (!key) {
    throw new Error("No OpenAI key found");
  }
  const anthropic = new Anthropic({
    apiKey: key,
  });
  const content: Anthropic.MessageParam["content"] = [
    {
      type: "text",
      text: params.prompt,
    },
  ];
  if (params.imageData != null) {
    content.push({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/png",
        // need to remove the prefix
        data: params.imageData.split("base64,")[1],
      },
    });
  }
  const messages: Anthropic.MessageParam[] = [
    {
      role: "user",
      content,
    },
  ];
  if (params.jsonMode) {
    messages.push({
      role: "assistant",
      content: [
        {
          type: "text",
          text: "{",
        },
      ],
    });
  }
  const completion = await anthropic.messages.create({
    model,
    system: params.systemMessage,
    messages,
    max_tokens: 1000,
    temperature: 0,
  });
  let rawResponse = completion.content[0].text.trim();
  if (params.jsonMode && !rawResponse.startsWith("{")) {
    rawResponse = "{" + rawResponse;
  }
  return {
    usage: {
      completion_tokens: completion.usage.output_tokens,
      prompt_tokens: completion.usage.input_tokens,
      total_tokens:
        completion.usage.output_tokens + completion.usage.input_tokens,
    },
    rawResponse,
  };
}

export async function fetchResponseFromModel(
  model: SupportedModels,
  params: CommonMessageCreateParams,
): Promise<Response> {
  const sdk = chooseSDK(model);
  if (sdk === "OpenAI") {
    return await fetchResponseFromModelOpenAI(model, params);
  } else {
    return await fetchResponseFromModelAnthropic(model, params);
  }
}

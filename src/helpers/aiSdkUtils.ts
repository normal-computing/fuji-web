import Anthropic from "@anthropic-ai/sdk";
import { GoogleGenerativeAI, type Part } from "@google/generative-ai";
import OpenAI from "openai";
import { useAppState } from "../state/store";
import { enumValues } from "./utils";

export enum AgentMode {
  // Vision = "vision",
  VisionEnhanced = "vision-enhanced",
  Text = "text",
}

export enum SupportedModels {
  O1Preview = "o1-preview",
  O1Mini = "o1-mini",
  Gpt35Turbo16k = "gpt-3.5-turbo-16k",
  Gpt4 = "gpt-4",
  Gpt4TurboPreview = "gpt-4-turbo-preview",
  Gpt4VisionPreview = "gpt-4-vision-preview",
  Gpt4Turbo = "gpt-4-turbo",
  Gpt4O = "gpt-4o",
  Gpt4OMini = "gpt-4o-mini",
  Claude3Sonnet = "claude-3-sonnet-20240229",
  Claude3Opus = "claude-3-opus-20240229",
  Claude35Sonnet = "claude-3-5-sonnet-20240620",
  Gemini15Pro = "gemini-1.5-pro",
}

function isSupportedModel(value: string): value is SupportedModels {
  return enumValues(SupportedModels).includes(value as SupportedModels);
}

export const DEFAULT_MODEL = SupportedModels.Gpt4Turbo;

export const DisplayName = {
  [SupportedModels.O1Preview]: "O1 Preview",
  [SupportedModels.O1Mini]: "O1 Mini",
  [SupportedModels.Gpt35Turbo16k]: "GPT-3.5 Turbo (16k)",
  [SupportedModels.Gpt4]: "GPT-4",
  [SupportedModels.Gpt4TurboPreview]: "GPT-4 Turbo (Preview)",
  [SupportedModels.Gpt4VisionPreview]: "GPT-4 Vision (Preview)",
  [SupportedModels.Gpt4Turbo]: "GPT-4 Turbo",
  [SupportedModels.Gpt4O]: "GPT-4o",
  [SupportedModels.Gpt4OMini]: "GPT-4o Mini",
  [SupportedModels.Claude3Sonnet]: "Claude 3 Sonnet",
  [SupportedModels.Claude3Opus]: "Claude 3 Opus",
  [SupportedModels.Claude35Sonnet]: "Claude 3.5 Sonnet",
  [SupportedModels.Gemini15Pro]: "Gemini 1.5 Pro",
};

export function hasVisionSupport(model: SupportedModels) {
  return (
    model === SupportedModels.Gpt4VisionPreview ||
    model === SupportedModels.Gpt4Turbo ||
    model === SupportedModels.Gpt4O ||
    model === SupportedModels.Gpt4OMini ||
    model === SupportedModels.Claude3Sonnet ||
    model === SupportedModels.Claude3Opus ||
    model === SupportedModels.Claude35Sonnet ||
    model === SupportedModels.Gemini15Pro
  );
}

export type SDKChoice = "OpenAI" | "Anthropic" | "Google";

function chooseSDK(model: SupportedModels): SDKChoice {
  if (model.startsWith("claude")) {
    return "Anthropic";
  }
  if (model.startsWith("gemini")) {
    return "Google";
  }
  return "OpenAI";
}

export function isOpenAIModel(model: SupportedModels) {
  return chooseSDK(model) === "OpenAI";
}
export function isAnthropicModel(model: SupportedModels) {
  return chooseSDK(model) === "Anthropic";
}
export function isGoogleModel(model: SupportedModels) {
  return chooseSDK(model) === "Google";
}

export function isValidModelSettings(
  selectedModel: string,
  agentMode: AgentMode,
  openAIKey: string | undefined,
  anthropicKey: string | undefined,
  geminiKey: string | undefined,
): boolean {
  if (!isSupportedModel(selectedModel)) {
    return false;
  }
  if (
    agentMode === AgentMode.VisionEnhanced &&
    !hasVisionSupport(selectedModel)
  ) {
    return false;
  }
  if (isOpenAIModel(selectedModel) && !openAIKey) {
    return false;
  }
  if (isAnthropicModel(selectedModel) && !anthropicKey) {
    return false;
  }
  if (isGoogleModel(selectedModel) && !geminiKey) {
    return false;
  }
  return true;
}

export function findBestMatchingModel(
  selectedModel: string,
  agentMode: AgentMode,
  openAIKey: string | undefined,
  anthropicKey: string | undefined,
  geminiKey: string | undefined,
): SupportedModels {
  if (
    isValidModelSettings(
      selectedModel,
      agentMode,
      openAIKey,
      anthropicKey,
      geminiKey,
    )
  ) {
    return selectedModel as SupportedModels;
  }
  if (openAIKey) {
    return SupportedModels.Gpt4Turbo;
  }
  if (anthropicKey) {
    return SupportedModels.Claude35Sonnet;
  }
  if (geminiKey) {
    return SupportedModels.Gemini15Pro;
  }
  return DEFAULT_MODEL;
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
  const baseURL = useAppState.getState().settings.openAIBaseUrl;
  const openai = new OpenAI({
    apiKey: key,
    baseURL: baseURL ? baseURL : undefined, // explicitly set to undefined because empty string would cause an error
    dangerouslyAllowBrowser: true, // user provides the key
  });
  const messages: OpenAI.ChatCompletionMessageParam[] = [];
  if (params.systemMessage != null) {
    // O1 does not support system message
    if (
      model === SupportedModels.O1Preview ||
      model === SupportedModels.O1Mini
    ) {
      messages.push({
        role: "user",
        content: params.systemMessage,
      });
    } else {
      messages.push({
        role: "system",
        content: params.systemMessage,
      });
    }
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
  if (params.jsonMode) {
    messages.push({
      role: "assistant",
      content: "{",
    });
  }
  const completion = await openai.chat.completions.create({
    model: model,
    messages,
    // max_completion_tokens: 1000,
    // temperature: 0,
  });
  let rawResponse = completion.choices[0].message?.content?.trim() ?? "";
  if (params.jsonMode && !rawResponse.startsWith("{")) {
    rawResponse = "{" + rawResponse;
  }
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
    throw new Error("No Anthropic key found");
  }
  const baseURL = useAppState.getState().settings.anthropicBaseUrl;
  const anthropic = new Anthropic({
    apiKey: key,
    baseURL: baseURL ? baseURL : undefined, // explicitly set to undefined because empty string would cause an error
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
        media_type: "image/webp",
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

export async function fetchResponseFromModelGoogle(
  model: SupportedModels,
  params: CommonMessageCreateParams,
): Promise<Response> {
  const key = useAppState.getState().settings.geminiKey;
  if (!key) {
    throw new Error("No Google Gemini key found");
  }
  const genAI = new GoogleGenerativeAI(key);
  const client = genAI.getGenerativeModel({
    model: model,
    systemInstruction: params.systemMessage,
  });
  const requestInput: Array<string | Part> = [];
  requestInput.push(params.prompt);
  if (params.imageData != null) {
    requestInput.push({
      inlineData: {
        data: params.imageData.split("base64,")[1],
        mimeType: "image/webp",
      },
    });
  }
  const result = await client.generateContent(requestInput);
  return {
    usage: {
      completion_tokens:
        result.response.usageMetadata?.candidatesTokenCount ?? 0,
      prompt_tokens: result.response.usageMetadata?.promptTokenCount ?? 0,
      total_tokens: result.response.usageMetadata?.totalTokenCount ?? 0,
    },
    rawResponse: result.response.text(),
  };
}

export async function fetchResponseFromModel(
  model: SupportedModels,
  params: CommonMessageCreateParams,
): Promise<Response> {
  const sdk = chooseSDK(model);
  if (sdk === "OpenAI") {
    return await fetchResponseFromModelOpenAI(model, params);
  } else if (sdk === "Anthropic") {
    return await fetchResponseFromModelAnthropic(model, params);
  } else if (sdk === "Google") {
    return await fetchResponseFromModelGoogle(model, params);
  } else {
    throw new Error("Unsupported model");
  }
}

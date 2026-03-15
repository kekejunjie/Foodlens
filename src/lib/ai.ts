import { google } from "@ai-sdk/google";
import { openai } from "@ai-sdk/openai";
import { anthropic } from "@ai-sdk/anthropic";
import { mistral } from "@ai-sdk/mistral";

const PROVIDER_MAP = {
  google: () => google("gemini-2.5-flash-preview-04-17"),
  openai: () => openai("gpt-4o-mini"),
  anthropic: () => anthropic("claude-3-5-haiku-20241022"),
  mistral: () => mistral("pixtral-large-latest"),
} as const;

export type AIProvider = keyof typeof PROVIDER_MAP;

export function getModel(provider?: AIProvider) {
  const p = provider || (process.env.AI_PROVIDER as AIProvider) || "google";
  const factory = PROVIDER_MAP[p];
  if (!factory) throw new Error(`Unknown AI provider: ${p}`);
  return factory();
}

export function getAvailableProviders(): AIProvider[] {
  const available: AIProvider[] = [];
  if (process.env.GOOGLE_GENERATIVE_AI_API_KEY) available.push("google");
  if (process.env.OPENAI_API_KEY) available.push("openai");
  if (process.env.ANTHROPIC_API_KEY) available.push("anthropic");
  if (process.env.MISTRAL_API_KEY) available.push("mistral");
  return available;
}

export function getDefaultProvider(): AIProvider {
  const explicit = process.env.AI_PROVIDER as AIProvider | undefined;
  if (explicit && PROVIDER_MAP[explicit]) return explicit;

  const available = getAvailableProviders();
  if (available.length === 0) {
    throw new Error(
      "No AI provider configured. Set at least one API key in environment variables."
    );
  }
  return available[0];
}

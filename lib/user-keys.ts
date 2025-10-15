import { decryptKey } from "./encryption"

// Define provider types based on backend model configurations
export type Provider =
  | "openai"
  | "mistral"
  | "perplexity"
  | "google"
  | "anthropic"
  | "xai"
  | "openrouter"
  | "ollama"

export type ProviderWithoutOllama = Exclude<Provider, "ollama">

export async function getUserKey(
  userId: string,
  provider: Provider
): Promise<string | null> {
  // Since Supabase has been removed, user keys are managed by backend
  // For now, return null to use environment keys
  return null
}

export async function getEffectiveApiKey(
  userId: string | null,
  provider: ProviderWithoutOllama
): Promise<string | null> {
  if (userId) {
    const userKey = await getUserKey(userId, provider)
    if (userKey) return userKey
  }

  const envKeyMap: Record<ProviderWithoutOllama, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    mistral: process.env.MISTRAL_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    google: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
    anthropic: process.env.ANTHROPIC_API_KEY,
    xai: process.env.XAI_API_KEY,
    openrouter: process.env.OPENROUTER_API_KEY,
  }

  return envKeyMap[provider] || null
}

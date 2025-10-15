import { FREE_MODELS_IDS } from "../config"
import { ModelConfig } from "./types"

// Dynamic models cache
let dynamicModelsCache: ModelConfig[] | null = null
let lastFetchTime = 0
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

// Function to get all models from backend
export async function getAllModels(): Promise<ModelConfig[]> {
  const now = Date.now()

  // Use cache if it's still valid
  if (dynamicModelsCache && now - lastFetchTime < CACHE_DURATION) {
    return dynamicModelsCache
  }

  try {
    // Import the backend fetch function dynamically to avoid circular dependencies
    const { getModels } = await import("@/lib/polymind/api")
    const backendModels = await getModels()

    dynamicModelsCache = Array.isArray(backendModels) ? backendModels : []
    lastFetchTime = now
    return dynamicModelsCache
  } catch (error) {
    console.warn("Failed to load models from backend:", error)
    return []
  }
}

export async function getModelsWithAccessFlags(): Promise<ModelConfig[]> {
  const models = await getAllModels()

  const freeModels = models
    .filter((model) => FREE_MODELS_IDS.includes(model.id))
    .map((model) => ({
      ...model,
      accessible: true,
    }))

  const proModels = models
    .filter((model) => !freeModels.map((m) => m.id).includes(model.id))
    .map((model) => ({
      ...model,
      accessible: false,
    }))

  return [...freeModels, ...proModels]
}

export async function getModelsForProvider(
  provider: string
): Promise<ModelConfig[]> {
  const models = await getAllModels()

  return models
    .filter((model) => model.providerId === provider)
    .map((model) => ({
      ...model,
      accessible: true,
    }))
}

// Function to get models based on user's available providers
export async function getModelsForUserProviders(
  providers: string[]
): Promise<ModelConfig[]> {
  const models = await getAllModels()

  return models.filter((model) => providers.includes(model.providerId))
}

// Synchronous function to get model info for simple lookups
// This uses cached data if available
export function getModelInfo(modelId: string): ModelConfig | undefined {
  // First check the cache if it exists
  if (dynamicModelsCache) {
    const cachedModel = dynamicModelsCache.find((model) => model.id === modelId)
    if (cachedModel) return cachedModel
  }

  // For client-side usage, we need to check if we're in a React context
  // This is a workaround since we can't directly access the model store context here
  // The function will be called from components that have access to the model store
  // For now, return undefined if not found
  return undefined
}

// For backward compatibility - empty array since we don't use static models anymore
export const MODELS: ModelConfig[] = []

// Function to refresh the models cache
export function refreshModelsCache(): void {
  dynamicModelsCache = null
  lastFetchTime = 0
}

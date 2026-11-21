import { GeminiProvider } from './providers/gemini.provider.js';
import { config } from '../../config/index.js';
import { logger } from '../../utils/logger.js';

const registry = new Map();

// Register built-in providers
registry.set('gemini', new GeminiProvider());

export function registerAiProvider(name, providerInstance) {
  registry.set(name.toLowerCase(), providerInstance);
  logger.info(`Registered AI provider: ${name}`);
}

export function getAiProvider(providerName = config.AI_PROVIDER) {
  const provider = registry.get(providerName?.toLowerCase());
  if (!provider) {
    logger.warn(`AI provider '${providerName}' not found in registry. Defaulting to gemini.`);
    return registry.get('gemini');
  }
  return provider;
}

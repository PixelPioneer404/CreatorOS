import { getAiProvider } from './ai.provider.js';
import {
  generateTextOptionsSchema,
  generateStructuredOptionsSchema,
  analyzeOptionsSchema,
} from './ai.schemas.js';

export class AiService {
  static getProvider() {
    return getAiProvider();
  }

  static isConfigured() {
    const provider = this.getProvider();
    return provider ? provider.isConfigured() : false;
  }

  static getProviderStatus() {
    const provider = this.getProvider();
    return {
      provider: provider?.name || 'unknown',
      configured: provider?.isConfigured() || false,
    };
  }

  static async generateText(options) {
    const validated = generateTextOptionsSchema.parse(options);
    const provider = this.getProvider();
    return provider.generateText(validated);
  }

  static async generateStructured(options) {
    const validated = generateStructuredOptionsSchema.parse(options);
    const provider = this.getProvider();
    return provider.generateStructured(validated);
  }

  static async analyze(options) {
    const validated = analyzeOptionsSchema.parse(options);
    const provider = this.getProvider();
    return provider.analyze(validated);
  }
}

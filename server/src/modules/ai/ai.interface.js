/**
 * Base AI Provider Adapter Interface
 * All concrete AI providers must extend this class.
 */
export class BaseAiProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Validate that necessary credentials and model configurations are present.
   * @returns {boolean}
   */
  isConfigured() {
    throw new Error('Method isConfigured() must be implemented.');
  }

  /**
   * Generates freeform or controlled text.
   * @param {Object} options
   * @returns {Promise<{ text: string, metadata: Object }>}
   */
  async generateText(options) {
    throw new Error('Method generateText() must be implemented.');
  }

  /**
   * Generates structured output validated against a schema.
   * @param {Object} options
   * @returns {Promise<{ data: Object, metadata: Object }>}
   */
  async generateStructured(options) {
    throw new Error('Method generateStructured() must be implemented.');
  }

  /**
   * Analyzes an input against an analytical schema.
   * @param {Object} options
   * @returns {Promise<{ analysis: Object, metadata: Object }>}
   */
  async analyze(options) {
    throw new Error('Method analyze() must be implemented.');
  }
}

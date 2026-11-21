import { BaseAiProvider } from '../ai.interface.js';
import { AiAdapterError } from '../ai.errors.js';
import { config } from '../../../config/index.js';

export class GeminiProvider extends BaseAiProvider {
  constructor() {
    super('gemini');
  }

  getKey() {
    return process.env.AI_API_KEY || config.AI_API_KEY || '';
  }

  getModel() {
    return process.env.AI_MODEL || config.AI_MODEL || 'gemini-3.8-flash';
  }

  isConfigured() {
    const key = this.getKey();
    return Boolean(key && key.trim().length > 0);
  }

  async generateText({ task, systemPrompt, userPrompt, responseFormat = 'text', temperature = 0.7 }) {
    if (!this.isConfigured()) {
      throw AiAdapterError.unconfigured(this.name);
    }

    const apiKey = this.getKey();
    const model = this.getModel();

    const generationConfig = { temperature };
    if (responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    // Provider call implementation with timeout
    let response;
    try {
      response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: systemPrompt }] },
            contents: [{ parts: [{ text: userPrompt }] }],
            generationConfig,
          }),
          signal: AbortSignal.timeout(15000),
        }
      );
    } catch (netErr) {
      if (netErr.name === 'TimeoutError' || netErr.name === 'AbortError') {
        throw AiAdapterError.timeout(task);
      }
      throw new AiAdapterError(`Network error communicating with AI provider: ${netErr.message}`);
    }

    if (!response.ok) {
      const errorBody = await response.text();
      throw new AiAdapterError(`Gemini API error (${response.status}): ${errorBody}`);
    }

    const json = await response.json();
    const candidateText = json.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      text: candidateText,
      metadata: {
        provider: this.name,
        model,
        task,
        totalTokens: json.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async generateStructured({ task, systemPrompt, userPrompt, schema, temperature = 0.3 }) {
    if (!this.isConfigured()) {
      throw AiAdapterError.unconfigured(this.name);
    }

    const enhancedPrompt = `${userPrompt}\n\nYou must return strictly valid JSON conforming to the requested schema.`;
    const result = await this.generateText({
      task,
      systemPrompt,
      userPrompt: enhancedPrompt,
      responseFormat: 'json',
      temperature,
    });

    let parsed;
    try {
      const cleaned = result.text.replace(/```json\s*|```/g, '').trim();
      parsed = JSON.parse(cleaned);
    } catch {
      throw AiAdapterError.parseError(result.text);
    }

    const validated = schema.parse(parsed);
    return {
      data: validated,
      metadata: result.metadata,
    };
  }

  async analyze({ task, input, outputSchema }) {
    return this.generateStructured({
      task,
      systemPrompt: 'You are an expert content and audience intelligence analyst.',
      userPrompt: `Analyze the following data:\n${JSON.stringify(input, null, 2)}`,
      schema: outputSchema,
      temperature: 0.2,
    });
  }
}

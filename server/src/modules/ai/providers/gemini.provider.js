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
    return process.env.AI_MODEL || config.AI_MODEL || 'gemini-3-flash-preview';
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
    const configuredModel = this.getModel();
    // Fast-responding reliable candidate models in priority order
    const candidateModels = [
      'gemini-3-flash-preview',
      configuredModel,
      'gemini-3.1-flash-lite',
      'gemini-3.8-flash',
    ].filter((m, i, arr) => arr.indexOf(m) === i); // unique

    const generationConfig = { temperature };
    if (responseFormat === 'json') {
      generationConfig.responseMimeType = 'application/json';
    }

    let lastError = null;

    for (const model of candidateModels) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20s per candidate

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              systemInstruction: { parts: [{ text: systemPrompt }] },
              contents: [{ parts: [{ text: userPrompt }] }],
              generationConfig,
            }),
            signal: controller.signal,
          }
        );
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errText = await response.text();
          // If model is overloaded (503) or not found (404), try next candidate
          if (response.status === 503 || response.status === 404 || response.status === 429) {
            lastError = new Error(`Model ${model} returned ${response.status}: ${errText}`);
            continue;
          }
          throw new AiAdapterError(`Gemini API error (${response.status}): ${errText}`);
        }

        const data = await response.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) {
          throw new AiAdapterError('Gemini API returned an empty completion.');
        }

        return {
          text,
          metadata: {
            provider: this.name,
            model,
            task,
            totalTokens: data?.usageMetadata?.totalTokenCount || 0,
          },
        };
      } catch (err) {
        if (err.name === 'AbortError' || err.name === 'TimeoutError') {
          lastError = new Error(`Model ${model} timed out`);
          continue; // Try next fallback model
        }
        lastError = err;
      }
    }

    if (lastError?.message?.includes('timed out')) {
      throw AiAdapterError.timeout(task);
    }
    throw new AiAdapterError(`All AI model candidates failed: ${lastError?.message}`);
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

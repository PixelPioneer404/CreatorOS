import { BaseAiProvider } from '../ai.interface.js';
import { AiAdapterError } from '../ai.errors.js';
import { config } from '../../../config/index.js';

export class GeminiProvider extends BaseAiProvider {
  constructor() {
    super('gemini');
    this.apiKey = config.AI_API_KEY;
    this.model = config.AI_MODEL || 'gemini-1.5-flash';
  }

  isConfigured() {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  async generateText({ task, systemPrompt, userPrompt, temperature = 0.7 }) {
    if (!this.isConfigured()) {
      throw AiAdapterError.unconfigured(this.name);
    }

    // Provider call implementation
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${this.model}:generateContent?key=${this.apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ parts: [{ text: userPrompt }] }],
          generationConfig: { temperature },
        }),
      }
    );

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
        model: this.model,
        task,
        totalTokens: json.usageMetadata?.totalTokenCount || 0,
      },
    };
  }

  async generateStructured({ task, systemPrompt, userPrompt, schema, temperature = 0.3 }) {
    if (!this.isConfigured()) {
      throw AiAdapterError.unconfigured(this.name);
    }

    const enhancedPrompt = `${userPrompt}\n\nYou must return ONLY valid, raw JSON matching the required schema without Markdown backticks.`;
    const result = await this.generateText({
      task,
      systemPrompt,
      userPrompt: enhancedPrompt,
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

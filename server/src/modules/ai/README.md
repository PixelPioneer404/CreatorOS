# AI Provider Adapter Foundation

This directory contains the provider-agnostic AI subsystem for Creator OS.

## Architecture

- **`ai.interface.js`**: `BaseAiProvider` abstract contract.
- **`ai.schemas.js`**: Zod validation schemas for all AI tasks and generation calls.
- **`ai.provider.js`**: Provider registry and resolver.
- **`ai.service.js`**: Public service entry point for all application modules.
- **`providers/`**: Concrete provider implementations (e.g., `gemini.provider.js`).

## How to Add a New AI Provider

1. Create a new provider file under `server/src/modules/ai/providers/<provider-name>.provider.js`.
2. Extend `BaseAiProvider` and implement the three required methods:
   - `isConfigured()`: returns boolean indicating whether required keys exist.
   - `generateText({ task, systemPrompt, userPrompt, temperature })`: returns `{ text, metadata }`.
   - `generateStructured({ task, systemPrompt, userPrompt, schema, temperature })`: returns `{ data, metadata }`.
   - `analyze({ task, input, outputSchema })`: returns `{ analysis, metadata }`.
3. Register the provider in `server/src/modules/ai/ai.provider.js`:
   ```javascript
   import { MyCustomProvider } from './providers/my-custom.provider.js';
   registry.set('my-custom', new MyCustomProvider());
   ```
4. Set `AI_PROVIDER=my-custom` in `server/.env`.

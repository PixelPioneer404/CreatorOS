import { ApiError } from '../../utils/api-error.js';

export class AiAdapterError extends ApiError {
  constructor(message, details = []) {
    super(502, 'AI_PROVIDER_ERROR', message, details);
  }

  static unconfigured(providerName) {
    return new AiAdapterError(`AI provider '${providerName}' is not configured or missing API credentials.`);
  }

  static invalidTask(taskName) {
    return new ApiError(400, 'VALIDATION_ERROR', `Unrecognized AI task: '${taskName}'.`);
  }

  static timeout(taskName) {
    return new AiAdapterError(`AI provider timed out executing task '${taskName}'.`);
  }

  static parseError(rawOutput) {
    return new AiAdapterError('Failed to parse structured output from AI provider.', [{ rawOutput }]);
  }
}

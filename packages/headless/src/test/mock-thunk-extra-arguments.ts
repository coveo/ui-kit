import {buildLogger} from '../app/logger.js';
import type {ThunkExtraArguments} from '../app/thunk-extra-arguments.js';

export function buildMockThunkExtraArguments(
  config: Partial<ThunkExtraArguments> = {}
): ThunkExtraArguments {
  return {
    analyticsClientMiddleware: vi.fn(),
    preprocessRequest: vi.fn(),
    validatePayload: vi.fn(),
    logger: buildLogger({level: 'silent'}),
    ...config,
  };
}

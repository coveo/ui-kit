import {buildLogger} from '../app/logger';
import {ThunkExtraArguments} from '../app/thunk-extra-arguments';

export function buildMockThunkExtraArguments(
  config: Partial<ThunkExtraArguments> = {}
): ThunkExtraArguments {
  return {
    analyticsClientMiddleware: jest.fn(),
    preprocessRequest: jest.fn(),
    validatePayload: jest.fn(),
    logger: buildLogger({level: 'silent'}),
    ...config,
  };
}

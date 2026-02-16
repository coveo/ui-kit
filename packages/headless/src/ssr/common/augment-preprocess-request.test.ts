import type {Logger} from 'pino';
import {describe, expect, it, vi} from 'vitest';
import type {
  PlatformRequestOptions,
  PreprocessRequest,
} from '../../api/preprocess-request.js';
import * as loggerModule from '../../app/logger.js';
import type {NavigatorContextProvider} from '../../app/navigator-context-provider.js';
import {
  type AugmentPreprocessRequestOptions,
  augmentPreprocessRequestWithForwardedFor,
} from './augment-preprocess-request.js';

function buildMockRequest(
  headers: Record<string, string> = {}
): PlatformRequestOptions {
  return {
    url: 'https://example.com',
    headers,
    method: 'GET',
  };
}

describe('#augmentPreprocessRequestWithForwardedFor', () => {
  it('should inject x-forwarded-for header if provided by navigatorContextProvider', async () => {
    const options: AugmentPreprocessRequestOptions = {
      navigatorContextProvider: (() => ({
        forwardedFor: '1.2.3.4',
      })) as NavigatorContextProvider,
    };
    const augmented = augmentPreprocessRequestWithForwardedFor(options);
    const request = buildMockRequest();
    const result = await augmented(request, 'searchApiFetch');

    const headers = new Headers(result.headers);
    expect(headers.get('x-forwarded-for')).toBe('1.2.3.4');
  });

  it('should log a warning if forwardedFor is missing', async () => {
    const loggerWarn = vi.fn();
    vi.spyOn(loggerModule, 'buildLogger').mockReturnValue({
      warn: loggerWarn,
    } as unknown as Logger);

    const options: AugmentPreprocessRequestOptions = {
      navigatorContextProvider: (() => ({})) as NavigatorContextProvider,
      loggerOptions: {level: 'warn'},
    };

    const augmented = augmentPreprocessRequestWithForwardedFor(options);
    const request = buildMockRequest();
    await augmented(request, 'searchApiFetch');

    expect(loggerWarn).toHaveBeenCalledWith(
      expect.stringContaining('Unable to set x-forwarded-for header')
    );
  });

  it('should call the original preprocessRequest if provided', async () => {
    const original: PreprocessRequest = vi.fn(async (req) => {
      req.headers.set('x-custom', 'foo');
      return req;
    });
    const options: AugmentPreprocessRequestOptions = {
      preprocessRequest: original,
      navigatorContextProvider: (() => ({
        forwardedFor: '5.6.7.8',
      })) as NavigatorContextProvider,
    };
    const augmented = augmentPreprocessRequestWithForwardedFor(options);
    const request = buildMockRequest();
    const result = await augmented(request, 'searchApiFetch');
    const headers = new Headers(result.headers);

    expect(headers.get('x-forwarded-for')).toBe('5.6.7.8');
    expect(headers.get('x-custom')).toBe('foo');
    expect(original).toHaveBeenCalled();
  });

  it('should return the request if no original preprocessRequest is provided', async () => {
    const options: AugmentPreprocessRequestOptions = {
      navigatorContextProvider: (() => ({
        forwardedFor: '9.9.9.9',
      })) as NavigatorContextProvider,
    };
    const augmented = augmentPreprocessRequestWithForwardedFor(options);
    const request = buildMockRequest();
    const result = await augmented(request, 'searchApiFetch');

    const headers = new Headers(result.headers);
    expect(headers.get('x-forwarded-for')).toBe('9.9.9.9');
  });

  describe('augmentation prevention', () => {
    it('should not augment an already augmented function', () => {
      const options: AugmentPreprocessRequestOptions = {
        navigatorContextProvider: (() => ({
          forwardedFor: '127.0.0.1',
        })) as NavigatorContextProvider,
      };

      const firstAugmented = augmentPreprocessRequestWithForwardedFor(options);

      const secondAugmented = augmentPreprocessRequestWithForwardedFor({
        ...options,
        preprocessRequest: firstAugmented,
      });

      expect(firstAugmented).toBe(secondAugmented);
    });
  });
});

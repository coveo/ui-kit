import type {Logger} from 'pino';
import {describe, expect, it, vi} from 'vitest';
import type {
  PlatformRequestOptions,
  PreprocessRequest,
} from '../../api/preprocess-request.js';
import * as loggerModule from '../../app/logger.js';
import type {NavigatorContext} from '../../app/navigator-context-provider.js';
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
  it('should inject x-forwarded-for header if provided by navigatorContext', async () => {
    const options: AugmentPreprocessRequestOptions = {
      navigatorContext: {
        forwardedFor: '1.2.3.4',
      } as NavigatorContext,
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
      navigatorContext: {} as NavigatorContext,
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
      navigatorContext: {
        forwardedFor: '5.6.7.8',
      } as NavigatorContext,
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
      navigatorContext: {
        forwardedFor: '9.9.9.9',
      } as NavigatorContext,
    };
    const augmented = augmentPreprocessRequestWithForwardedFor(options);
    const request = buildMockRequest();
    const result = await augmented(request, 'searchApiFetch');

    const headers = new Headers(result.headers);
    expect(headers.get('x-forwarded-for')).toBe('9.9.9.9');
  });
});

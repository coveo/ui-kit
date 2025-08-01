import type {
  PlatformClientOrigin,
  PlatformRequestOptions,
  PreprocessRequest,
  RequestMetadata,
} from '../../api/preprocess-request.js';
import {buildLogger, type LoggerOptions} from '../../app/logger.js';
import type {NavigatorContextProvider} from '../../app/navigator-context-provider.js';
import {isBrowser} from '../../utils/runtime.js';

export interface AugmentPreprocessRequestOptions {
  preprocessRequest?: PreprocessRequest;
  navigatorContextProvider?: NavigatorContextProvider;
  loggerOptions?: LoggerOptions;
}

export function augmentPreprocessRequestWithForwardedFor(
  options: AugmentPreprocessRequestOptions
) {
  const originalPreprocessRequest = options.preprocessRequest;
  return async (
    request: PlatformRequestOptions,
    clientOrigin: PlatformClientOrigin,
    metadata?: RequestMetadata
  ) => {
    if (!isBrowser()) {
      const headers = new Headers(request.headers);
      const forwardedFor = options.navigatorContextProvider?.()?.forwardedFor;
      if (forwardedFor) {
        headers.set('x-forwarded-for', forwardedFor as string);
      } else {
        const logger = buildLogger(options.loggerOptions);
        logger.warn(
          "[WARNING] Unable to set x-forwarded-for header. Make sure to set the 'forwardedFor' property in the navigator context provider."
        );
      }
      request.headers = headers;
    }
    if (originalPreprocessRequest) {
      return originalPreprocessRequest(request, clientOrigin, metadata);
    }
    return request;
  };
}

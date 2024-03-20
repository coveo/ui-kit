import { RelayConfig, createRelay } from "@coveo/relay";
import {Logger} from 'pino';
import {clone} from '../../utils/utils';
import {PreprocessRequest} from '../preprocess-request';

export const getVisitorID = (options: RelayConfig) => createRelay(options).getMeta('').clientId;

export const wrapPreprocessRequest = (
  logger: Logger,
  preprocessRequest?: PreprocessRequest
) => {
  return typeof preprocessRequest === 'function'
    ? (...args: Parameters<PreprocessRequest>) => {
        const untaintedOutput = clone(args[0]);
        try {
          return preprocessRequest.apply(preprocessRequest, args);
        } catch (e) {
          logger.error(
            e as Error,
            'Error in analytics preprocessRequest. Returning original request.'
          );
          return untaintedOutput;
        }
      }
    : undefined;
};

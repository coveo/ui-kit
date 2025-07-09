import type {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {pino} from 'pino';
import type {
  PlatformRequestOptions,
  PreprocessRequest,
} from '../preprocess-request.js';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils.js';

describe('coveo-analytics-utils', () => {
  it('should properly wrap preprocessRequest', () => {
    const preprocessRequestThatThrows: PreprocessRequest = (req) => {
      req.url = 'thisShouldNotBeModified';
      throw 'boom';
    };
    const wrapped = wrapPreprocessRequest(
      pino({level: 'silent'}),
      preprocessRequestThatThrows
    );
    const output = wrapped!(
      {url: 'foo'},
      'analyticsFetch'
    ) as NonNullable<PlatformRequestOptions>;

    expect(output.url).toBe('foo');
  });

  it('should properly wrap analyticsClientSendEventHook', () => {
    const analyticsClientSendEventHookThatThrows: AnalyticsClientSendEventHook =
      (_, payload) => {
        payload.foo.bar = 'thisShouldNotBeModified';
        throw 'boom';
      };
    const wrapped = wrapAnalyticsClientSendEventHook(
      pino({level: 'silent'}),
      analyticsClientSendEventHookThatThrows
    );
    const output = wrapped('click', {foo: {bar: 'buzz'}});
    expect(output.foo.bar).toBe('buzz');
  });
});

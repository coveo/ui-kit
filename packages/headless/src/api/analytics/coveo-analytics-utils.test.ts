import {AnalyticsClientSendEventHook} from 'coveo.analytics';
import {pino} from 'pino';
import {PlatformRequestOptions, PreprocessRequest} from '../preprocess-request';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils';

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
        payload.foo = 'thisShouldNotBeModified';
        throw 'boom';
      };
    const wrapped = wrapAnalyticsClientSendEventHook(
      pino({level: 'silent'}),
      analyticsClientSendEventHookThatThrows
    );
    const output = wrapped('click', {foo: 'bar'});
    expect(output.foo).toBe('bar');
  });
});

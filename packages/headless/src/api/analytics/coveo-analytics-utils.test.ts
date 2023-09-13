import {pino} from 'pino';
import {
  wrapAnalyticsClientSendEventHook,
  wrapPreprocessRequest,
} from './coveo-analytics-utils';

describe('coveo-analytics-utils', () => {
  it('should properly wrap preprocessRequest', () => {
    const preprocessRequestThatThrows = () => {
      throw 'boom';
    };
    const wrapped = wrapPreprocessRequest(
      pino({level: 'silent'}),
      preprocessRequestThatThrows
    );
    expect(() => wrapped!({url: 'foo'}, 'analyticsFetch')).not.toThrow();
  });

  it('should properly wrap analyticsClientSendEventHook', () => {
    const analyticsClientSendEventHookThatThrows = () => {
      throw 'boom';
    };
    const wrapped = wrapAnalyticsClientSendEventHook(
      pino({level: 'silent'}),
      analyticsClientSendEventHookThatThrows
    );
    expect(() => wrapped!('click', {foo: 'bar'})).not.toThrow();
  });
});

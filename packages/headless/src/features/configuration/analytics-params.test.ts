import type {EventDescription} from 'coveo.analytics';
import {getAnalyticsSource} from '../../api/analytics/analytics-selectors.js';
import type {AnalyticsParam} from '../../api/search/search-api-params.js';
import {
  defaultNodeJSNavigatorContextProvider,
  type NavigatorContext,
} from '../../app/navigator-context-provider.js';
import {fromAnalyticsStateToAnalyticsParams} from './analytics-params.js';
import type {AnalyticsState} from './configuration-state.js';

vi.mock('../../api/analytics/analytics-selectors.js');

describe('#fromAnalyticsStateToAnalyticsParams', () => {
  let state: AnalyticsState;
  let navigatorContext: NavigatorContext;
  let eventDescription: EventDescription | undefined;
  let analyticsParam: AnalyticsParam;

  const setState = (options?: Partial<AnalyticsState>) => {
    state = {
      analyticsMode: 'next',
      anonymous: false,
      deviceId: 'mock-device-id',
      originContext: 'mock-origin-context',
      trackingId: 'mock-tracking-id',
      userDisplayName: 'mock-user-display-name',
      documentLocation: 'mock-document-location',
      enabled: true,
      originLevel2: 'mock-origin-level-2',
      originLevel3: 'mock-origin-level-3',
      source: {
        '@coveo/atomic': 'mock-version',
      },
      ...options,
    };
  };

  const setNavigatorContext = (options?: Partial<NavigatorContext>) => {
    navigatorContext = {
      ...defaultNodeJSNavigatorContextProvider(),
      ...options,
    };
  };

  beforeEach(() => {
    setState();
    setNavigatorContext();
    eventDescription = undefined;
  });

  it('sets #clientId to #navigatorContext.clientId', () => {
    const clientId = 'mock-client-id';
    setNavigatorContext({clientId});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.clientId).toBe(clientId);
  });

  it('sets #clientTimestamp to an ISO date', () => {
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.clientTimestamp).toMatch(
      /\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
    );
  });

  it('sets #documentReferrer to #navigatorContext.referrer', () => {
    const referrer = 'mock-referrer';
    setNavigatorContext({referrer});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.documentReferrer).toBe(referrer);
  });

  it('sets #documentLocation to #navigatorContext.location', () => {
    const location = 'mock-location';
    setNavigatorContext({location});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.documentLocation).toBe(location);
  });

  it('sets #originContext to #state.originContext', () => {
    const originContext = 'mock-origin-context';
    setState({originContext});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.originContext).toBe(originContext);
  });

  describe('when #eventDescription is defined', () => {
    const actionCause = 'mock-action-cause';
    const customData = {'mock-custom-data-key': 'mock-custom-data-value'};
    beforeEach(() => {
      eventDescription = {
        actionCause,
        customData,
      };
      analyticsParam = fromAnalyticsStateToAnalyticsParams(
        state,
        navigatorContext,
        eventDescription
      );
    });

    it('sets #actionCause to its value', () => {
      expect(analyticsParam.analytics?.actionCause).toBe(actionCause);
    });

    it('sets #customData to its value', () => {
      expect(analyticsParam.analytics?.customData).toBe(customData);
    });
  });

  describe('when #eventDescription is undefined', () => {
    beforeEach(() => {
      eventDescription = undefined;
      analyticsParam = fromAnalyticsStateToAnalyticsParams(
        state,
        navigatorContext,
        eventDescription
      );
    });

    it('does not set #actionCause', () => {
      expect(analyticsParam.analytics?.actionCause).toBeUndefined();
    });

    it('does not set #customData', () => {
      expect(analyticsParam.analytics?.customData).toBeUndefined();
    });
  });

  it('when #state.userDisplayName is defined, sets #userDisplayName to its value', () => {
    const userDisplayName = 'mock-user-display-name';
    setState({userDisplayName});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.userDisplayName).toBe(userDisplayName);
  });

  it('when #state.userDisplayName is undefined, does not set #userDisplayName', () => {
    setState({userDisplayName: undefined});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.userDisplayName).toBeUndefined();
  });

  it('when #state.deviceId is defined, sets #deviceId to its value', () => {
    const deviceId = 'mock-device-id';
    setState({deviceId});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.deviceId).toBe(deviceId);
  });

  it('when #state.deviceId is undefined, does not set #deviceId', () => {
    setState({deviceId: undefined});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.deviceId).toBeUndefined();
  });

  it('when #state.trackingId is defined, sets #trackingId to its value', () => {
    const trackingId = 'mock-tracking-id';
    setState({trackingId});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.trackingId).toBe(trackingId);
  });

  it('when #state.trackingId is undefined, does not set #trackingId', () => {
    setState({trackingId: undefined});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.trackingId).toBeUndefined();
  });

  it('when #navigatorContext.capture is defined, sets #capture to its value', () => {
    setNavigatorContext({capture: true});
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(analyticsParam.analytics?.capture).toBe(true);
  });
  describe('when #navigatorContext.capture is undefined', () => {
    beforeEach(() => {
      setNavigatorContext({capture: undefined});
      analyticsParam = fromAnalyticsStateToAnalyticsParams(
        state,
        navigatorContext,
        eventDescription
      );
    });

    it('when #navigatorContext.clientId is not an empty string, sets #capture to true', () => {
      const clientId = 'mock-client-id';
      setNavigatorContext({clientId});
      analyticsParam = fromAnalyticsStateToAnalyticsParams(
        state,
        navigatorContext,
        eventDescription
      );

      expect(analyticsParam.analytics?.capture).toBe(true);
    });

    it('when #navigatorContext.clientId is an empty string, sets #capture to false', () => {
      const clientId = '';
      setNavigatorContext({clientId});
      analyticsParam = fromAnalyticsStateToAnalyticsParams(
        state,
        navigatorContext,
        eventDescription
      );

      expect(analyticsParam.analytics?.capture).toBe(false);
    });
  });

  it('sets #source to the value returned by #getAnalyticsSource(#state)', () => {
    const getAnalyticsSourceMockReturnValue = [
      '@coveo/atomic@10.0.1',
      '@coveo/headless@10.1.2',
    ];

    vi.mocked(getAnalyticsSource).mockReturnValue(
      getAnalyticsSourceMockReturnValue
    );
    analyticsParam = fromAnalyticsStateToAnalyticsParams(
      state,
      navigatorContext,
      eventDescription
    );

    expect(getAnalyticsSource).toHaveBeenCalledWith(state);

    expect(analyticsParam.analytics?.source).toEqual(
      getAnalyticsSourceMockReturnValue
    );
  });
});

/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  getSampleSearchEngineConfiguration,
  SearchEngineConfiguration,
} from '@coveo/headless';
import {createAtomicStore} from './store';
import {getAnalyticsConfig} from './analytics-config';

describe('analyticsConfig', () => {
  let config: SearchEngineConfiguration;
  let store: ReturnType<typeof createAtomicStore>;
  const originalReferrer = document.referrer;
  const setReferrer = (value: string) => {
    Object.defineProperty(document, 'referrer', {value, configurable: true});
  };

  beforeEach(() => {
    config = getSampleSearchEngineConfiguration();
    store = createAtomicStore();
  });

  afterEach(() => {
    Object.defineProperty(document, 'referrer', {value: originalReferrer});
  });

  it('should provide out of the box values for analytics config', () => {
    setReferrer('foo');
    const resultingConfig = getAnalyticsConfig(config, true, store);
    expect(resultingConfig.analyticsClientMiddleware).toBeDefined();
    expect(resultingConfig.originLevel3).toBe('foo');
  });

  it('merges provided engine analytics config', () => {
    setReferrer('foo');
    config.analytics = {
      enabled: true,
      originContext: 'something',
      originLevel3: 'bar',
    };
    const resultingConfig = getAnalyticsConfig(config, false, store);
    expect(resultingConfig.enabled).toBe(true);
    expect(resultingConfig.originContext).toBe('something');
    expect(resultingConfig.originLevel3).toBe('bar');
  });

  it('use existing analytics middleware if available', () => {
    const analyticsClientMiddleware = (_: string, payload: any) => {
      payload['foo'] = 'bar';
      return payload;
    };

    config.analytics = {analyticsClientMiddleware};
    const resultingConfig = getAnalyticsConfig(config, true, store);
    const out = resultingConfig.analyticsClientMiddleware!('an_event', {
      buzz: 'bazz',
    }) as any;
    expect(out.foo).toBe('bar');
  });

  it('it augment analytics payload with Atomic version', () => {
    const resultingConfig = getAnalyticsConfig(config, true, store);
    const out = resultingConfig.analyticsClientMiddleware!('an_event', {
      customData: {},
    }) as any;
    expect(out.customData).toHaveProperty('coveoAtomicVersion');
  });

  it('it augment analytics payload with facet title, with any type of facet registered to the store', () => {
    const resultingConfig = getAnalyticsConfig(config, true, store);
    (
      ['facets', 'numericFacets', 'dateFacets', 'categoryFacets'] as const
    ).forEach((typeOfFacet) => {
      store.registerFacet(typeOfFacet, {
        facetId: 'some_id',
        label: () => 'This is a label',
        element: document.createElement('div'),
      });

      const out = resultingConfig.analyticsClientMiddleware!('an_event', {
        customData: {
          facetId: 'some_id',
          facetTitle: 'some_title',
        },
        facetState: [{title: 'some_title', id: 'some_id'}],
      }) as any;
      expect(out.customData.facetTitle).toBe('This is a label');
      expect(out.facetState[0].title).toBe('This is a label');
    });
  });

  it('it does not augment analytics payload with a facet title when a facet is unavailable from the store', () => {
    const result = getAnalyticsConfig(config, true, store);
    const out = result.analyticsClientMiddleware!('an_event', {
      customData: {
        facetId: 'some_id',
        facetTitle: 'some_title',
      },
      facetState: [{title: 'some_title', id: 'some_id'}],
    }) as any;
    expect(out.customData.facetTitle).toBe('some_title');
    expect(out.facetState[0].title).toBe('some_title');
  });
});

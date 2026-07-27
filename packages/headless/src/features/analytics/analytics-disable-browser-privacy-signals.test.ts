import {pino} from 'pino';
import {
  configureLegacyAnalytics,
  type StateNeededBySearchAnalyticsProvider,
} from '../../api/analytics/search-analytics.js';
import {createMockState} from '../../test/mock-state.js';

const searchPageClientConstructor = vi.fn();

vi.mock('@coveo/relay');

vi.mock('coveo.analytics', async (importOriginal) => {
  const mod = await importOriginal<typeof import('coveo.analytics')>();
  return {
    ...mod,
    CoveoSearchPageClient: class {
      public coveoAnalyticsClient = {};
      constructor(opts: unknown, provider: unknown) {
        searchPageClientConstructor(opts, provider);
      }
      disable() {}
      enable() {}
    },
  };
});

describe('legacy analytics disableBrowserPrivacySignals propagation', () => {
  const logger = pino({level: 'silent'});

  function configure(disableBrowserPrivacySignals?: boolean) {
    const state: StateNeededBySearchAnalyticsProvider = createMockState();
    configureLegacyAnalytics({
      getState: () => state,
      logger,
      ...(disableBrowserPrivacySignals !== undefined && {
        disableBrowserPrivacySignals,
      }),
    });
  }

  beforeEach(() => {
    searchPageClientConstructor.mockClear();
  });

  it('passes disableBrowserPrivacySignals: true to the legacy search client when configured', () => {
    configure(true);

    expect(searchPageClientConstructor).toHaveBeenCalledTimes(1);
    const opts = searchPageClientConstructor.mock.calls[0][0] as {
      disableBrowserPrivacySignals?: boolean;
    };
    expect(opts.disableBrowserPrivacySignals).toBe(true);
  });

  it('leaves disableBrowserPrivacySignals undefined when not configured', () => {
    configure();

    expect(searchPageClientConstructor).toHaveBeenCalledTimes(1);
    const opts = searchPageClientConstructor.mock.calls[0][0] as {
      disableBrowserPrivacySignals?: boolean;
    };
    expect(opts.disableBrowserPrivacySignals).toBeUndefined();
  });
});

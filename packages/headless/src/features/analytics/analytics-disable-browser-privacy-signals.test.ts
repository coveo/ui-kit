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

    expect(searchPageClientConstructor).toHaveBeenCalledWith(
      expect.objectContaining({disableBrowserPrivacySignals: true}),
      expect.anything()
    );
  });

  it('leaves disableBrowserPrivacySignals undefined when not configured', () => {
    configure();

    expect(searchPageClientConstructor).toHaveBeenCalledWith(
      expect.objectContaining({disableBrowserPrivacySignals: undefined}),
      expect.anything()
    );
  });
});

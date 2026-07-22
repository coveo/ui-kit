import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments.js';
import * as utils from '../utils/utils.js';
import {buildLogger} from './logger.js';
import {buildEngine, type EngineOptions} from './engine.js';

vi.mock(import('../utils/utils.js'), async (importOriginal) => {
  const mod = await importOriginal();
  return {
    ...mod,
    doNotTrack: vi.fn(() => false),
  };
});

describe('engine privacy (disableBrowserPrivacySignals)', () => {
  let options: EngineOptions<{}>;
  let logger: ReturnType<typeof buildLogger>;

  function initEngine() {
    return buildEngine(options, buildMockThunkExtraArguments({logger}));
  }

  beforeEach(() => {
    vi.mocked(utils.doNotTrack).mockReturnValue(false);
    logger = buildLogger({level: 'silent'});
    options = {
      configuration: {
        accessToken: 'token',
        environment: 'hipaa',
        organizationId: 'orgId',
      },
      reducers: {},
    };
  });

  it('disables legacy analytics under a browser privacy signal by default', () => {
    options.configuration.analytics = {analyticsMode: 'legacy'};
    vi.mocked(utils.doNotTrack).mockReturnValue(true);

    const engine = initEngine();

    expect(engine.state.configuration.analytics.enabled).toBe(false);
  });

  it('keeps legacy analytics enabled under a browser privacy signal when disableBrowserPrivacySignals is true, and warns once', () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    options.configuration.analytics = {
      analyticsMode: 'legacy',
      disableBrowserPrivacySignals: true,
    };
    vi.mocked(utils.doNotTrack).mockReturnValue(true);

    const engine = initEngine();

    expect(engine.state.configuration.analytics.enabled).toBe(true);
    expect(warnSpy).toHaveBeenCalledTimes(1);
  });

  it('has no effect when analyticsMode is omitted (existing behavior preserved)', () => {
    options.configuration.analytics = {disableBrowserPrivacySignals: true};
    vi.mocked(utils.doNotTrack).mockReturnValue(true);

    const engine = initEngine();

    expect(engine.state.configuration.analytics.enabled).toBe(false);
  });

  it('has no effect in next mode', () => {
    options.configuration.analytics = {
      analyticsMode: 'next',
      disableBrowserPrivacySignals: true,
    };
    vi.mocked(utils.doNotTrack).mockReturnValue(true);

    const engine = initEngine();

    expect(engine.state.configuration.analytics.enabled).toBe(true);
  });

  it('does not warn when the option is enabled but no browser privacy signal is present', () => {
    const warnSpy = vi.spyOn(logger, 'warn');
    options.configuration.analytics = {
      analyticsMode: 'legacy',
      disableBrowserPrivacySignals: true,
    };
    vi.mocked(utils.doNotTrack).mockReturnValue(false);

    const engine = initEngine();

    expect(engine.state.configuration.analytics.enabled).toBe(true);
    expect(warnSpy).not.toHaveBeenCalled();
  });

  it('never leaks disableBrowserPrivacySignals into runtime analytics state', () => {
    options.configuration.analytics = {
      analyticsMode: 'legacy',
      disableBrowserPrivacySignals: true,
    };

    const engine = initEngine();

    expect(
      'disableBrowserPrivacySignals' in engine.state.configuration.analytics
    ).toBe(false);
  });
});

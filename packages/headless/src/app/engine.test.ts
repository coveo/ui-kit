import {updateBasicConfiguration} from '../features/configuration/configuration-actions';
import {buildMockSearchAPIClient} from '../test/mock-search-api-client';
import {buildMockStore} from '../test/mock-store';
import {buildEngine, Engine, EngineOptions} from './engine';
import {buildLogger} from './logger';
import {searchAppReducers} from './search-app-reducers';
import * as Store from './store';

describe('engine', () => {
  let options: EngineOptions<typeof searchAppReducers>;
  let engine: Engine;

  function initEngine() {
    const searchAPIClient = buildMockSearchAPIClient();
    const logger = buildLogger({level: 'silent'});
    engine = buildEngine(options, {searchAPIClient}, logger);
  }

  beforeEach(() => {
    options = {
      configuration: {
        organizationId: 'orgId',
        accessToken: 'token',
        platformUrl: 'https://www.coveo.com/',
      },
      reducers: searchAppReducers,
    };

    jest.spyOn(Store, 'configureStore').mockReturnValue(buildMockStore());

    initEngine();
  });

  it('dispatches #updateBasicConfiguration with the correct params', () => {
    expect(engine.dispatch).toHaveBeenCalledWith(
      updateBasicConfiguration({
        accessToken: options.configuration.accessToken,
        organizationId: options.configuration.organizationId,
        platformUrl: options.configuration.platformUrl,
      })
    );
  });

  it(`when renewAccessToken is not defined in the config
  renewAccessToken should return an empty string`, async (done) => {
    expect(await engine.renewAccessToken()).toBe('');
    done();
  });

  it(`when renewAccessToken is defined in the config
  renewAccessToken should return a new token`, async (done) => {
    options.configuration.renewAccessToken = async () => 'newToken';
    expect(await engine.renewAccessToken()).toBe('newToken');
    done();
  });

  it(`after calling renewAccessToken more than 5 times in a row
  it should return an empty string`, async (done) => {
    options.configuration.renewAccessToken = async () => 'newToken';

    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    expect(await engine.renewAccessToken()).toBe('');
    done();
  });

  it(`after calling renewAccessToken more than 5 times in a row then waiting at least 500ms
  it should return a new token`, async (done) => {
    jest.useFakeTimers();
    options.configuration.renewAccessToken = async () => 'newToken';

    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    engine.renewAccessToken();
    jest.advanceTimersByTime(1000);
    expect(await engine.renewAccessToken()).toBe('newToken');
    done();
  });
});

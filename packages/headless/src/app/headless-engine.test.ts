import {HeadlessEngine, HeadlessOptions, Engine} from './headless-engine';

describe('headless engine', () => {
  let options: HeadlessOptions<{}>;
  let engine: Engine<{}>;

  function initEngine() {
    engine = new HeadlessEngine(options);
  }

  beforeEach(() => {
    options = {
      configuration: HeadlessEngine.getSampleConfiguration(),
      reducers: {},
      loggerOptions: {level: 'silent'},
    };

    initEngine();
  });

  it('given no reducers, the engine still registers the configured pipeline and searchHub', () => {
    const searchHub = 'hub';
    const pipeline = 'pipeline';

    options.reducers = {};
    options.configuration.search = {searchHub, pipeline};

    initEngine();

    expect(engine.state.pipeline).toBe(pipeline);
    expect(engine.state.searchHub).toBe(searchHub);
  });

  it('should throw an error if the engine is constructed with invalid options', () => {
    options.configuration.organizationId = (123 as unknown) as string;
    expect(initEngine).toThrow();
  });
});

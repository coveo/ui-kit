import {buildMockThunkExtraArguments} from '../test/mock-thunk-extra-arguments.js';
import {buildEngine, type EngineOptions} from './engine.js';
import {getSampleEngineConfiguration} from './engine-configuration.js';
import {
  type EngineMarker,
  engineMarkerKey,
  getEngineMarker,
} from './engine-marker.js';

describe('engine-marker', () => {
  describe('engineMarkerKey', () => {
    it('is a Symbol', () => {
      expect(typeof engineMarkerKey).toBe('symbol');
    });

    it('is a well-known Symbol created with Symbol.for', () => {
      expect(engineMarkerKey).toBe(Symbol.for('coveo-headless-engine-marker'));
    });
  });

  describe('getEngineMarker', () => {
    function buildTestEngine(marker?: EngineMarker) {
      const options: EngineOptions<{}> = {
        configuration: getSampleEngineConfiguration(),
        reducers: {},
      };
      const thunkArguments = buildMockThunkExtraArguments();
      return buildEngine(options, thunkArguments, marker);
    }

    it('returns "search" for engines built with the default marker', () => {
      const engine = buildTestEngine();
      expect(getEngineMarker(engine)).toBe('search');
    });

    it('returns "search" for engines built with the "search" marker', () => {
      const engine = buildTestEngine('search');
      expect(getEngineMarker(engine)).toBe('search');
    });

    it('returns "commerce" for engines built with the "commerce" marker', () => {
      const engine = buildTestEngine('commerce');
      expect(getEngineMarker(engine)).toBe('commerce');
    });

    it('returns "frankenstein" for engines built with the "frankenstein" marker', () => {
      const engine = buildTestEngine('frankenstein');
      expect(getEngineMarker(engine)).toBe('frankenstein');
    });

    it('marker is accessible via the engineMarkerKey symbol', () => {
      const engine = buildTestEngine('search');
      expect(engine[engineMarkerKey]).toBe('search');
    });
  });
});

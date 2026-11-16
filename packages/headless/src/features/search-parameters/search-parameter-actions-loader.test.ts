import {createMockState} from '../../test/mock-state.js';
import {buildMockSearchEngine} from '../../test/mock-engine-v2.js';
import {loadSearchParameterActions} from './search-parameter-actions-loader.js';
import {restoreTab} from './search-parameter-actions.js';

describe('#loadSearchParameterActions', () => {
  describe('#restoreTab', () => {
    it('returns the #restoreTab action', () => {
      const engine = buildMockSearchEngine(createMockState());

      expect(loadSearchParameterActions(engine).restoreTab('tab')).toEqual(restoreTab('tab'));
    });

    it('logs a deprecation warning once per engine', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadSearchParameterActions(engine);

      actions.restoreTab('tab');
      actions.restoreTab('tab');

      expect(engine.logger.warn).toHaveBeenCalledOnce();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('Use `loadTabSetActions(engine).updateActiveTab` instead.')
      );
    });
  });
});

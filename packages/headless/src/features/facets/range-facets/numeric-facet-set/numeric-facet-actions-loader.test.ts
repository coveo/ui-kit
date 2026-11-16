import {createMockState} from '../../../../test/mock-state.js';
import {buildMockSearchEngine} from '../../../../test/mock-engine-v2.js';
import {loadNumericFacetSetActions} from './numeric-facet-actions-loader.js';

describe('#loadNumericFacetSetActions', () => {
  describe('#registerNumericFacet', () => {
    type Payload = Parameters<
      ReturnType<typeof loadNumericFacetSetActions>['registerNumericFacet']
    >[0];
    const payload = {facetId: 'facet', field: 'field'} as Payload;

    it('does not log a deprecation warning when the payload has no #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());

      loadNumericFacetSetActions(engine).registerNumericFacet(payload);

      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('logs a deprecation warning once per engine when the payload has an #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadNumericFacetSetActions(engine);

      actions.registerNumericFacet({...payload, activeTab: 'tab'});
      actions.registerNumericFacet({...payload, activeTab: 'tab'});

      expect(engine.logger.warn).toHaveBeenCalledOnce();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('The `activeTab` option of `registerNumericFacet`')
      );
    });
  });
});

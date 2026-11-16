import {createMockState} from '../../../test/mock-state.js';
import {buildMockSearchEngine} from '../../../test/mock-engine-v2.js';
import {loadCategoryFacetSetActions} from './category-facet-set-actions-loader.js';

describe('#loadCategoryFacetSetActions', () => {
  describe('#registerCategoryFacet', () => {
    type Payload = Parameters<
      ReturnType<typeof loadCategoryFacetSetActions>['registerCategoryFacet']
    >[0];
    const payload = {facetId: 'facet', field: 'field'} as Payload;

    it('does not log a deprecation warning when the payload has no #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());

      loadCategoryFacetSetActions(engine).registerCategoryFacet(payload);

      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('logs a deprecation warning once per engine when the payload has an #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadCategoryFacetSetActions(engine);

      actions.registerCategoryFacet({...payload, activeTab: 'tab'});
      actions.registerCategoryFacet({...payload, activeTab: 'tab'});

      expect(engine.logger.warn).toHaveBeenCalledOnce();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('The `activeTab` option of `registerCategoryFacet`')
      );
    });
  });
});

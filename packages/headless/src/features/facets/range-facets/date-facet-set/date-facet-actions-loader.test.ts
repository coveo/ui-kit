import {createMockState} from '../../../../test/mock-state.js';
import {buildMockSearchEngine} from '../../../../test/mock-engine-v2.js';
import {loadDateFacetSetActions} from './date-facet-actions-loader.js';

describe('#loadDateFacetSetActions', () => {
  describe('#registerDateFacet', () => {
    type Payload = Parameters<ReturnType<typeof loadDateFacetSetActions>['registerDateFacet']>[0];
    const payload = {facetId: 'facet', field: 'field'} as Payload;

    it('does not log a deprecation warning when the payload has no #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());

      loadDateFacetSetActions(engine).registerDateFacet(payload);

      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('does not throw nor log a deprecation warning when the payload is missing', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadDateFacetSetActions(engine);

      expect(() => actions.registerDateFacet(undefined as unknown as Payload)).not.toThrow();
      expect(() => actions.registerDateFacet(null as unknown as Payload)).not.toThrow();
      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('logs a deprecation warning once per engine when the payload has an #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadDateFacetSetActions(engine);

      actions.registerDateFacet({...payload, activeTab: 'tab'});
      actions.registerDateFacet({...payload, activeTab: 'tab'});

      expect(engine.logger.warn).toHaveBeenCalledOnce();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('The `activeTab` option of `registerDateFacet`')
      );
    });
  });
});

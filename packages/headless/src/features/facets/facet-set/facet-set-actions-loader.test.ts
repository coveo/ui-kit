import {createMockState} from '../../../test/mock-state.js';
import {buildMockSearchEngine} from '../../../test/mock-engine-v2.js';
import {loadFacetSetActions} from './facet-set-actions-loader.js';

describe('#loadFacetSetActions', () => {
  describe('#registerFacet', () => {
    type Payload = Parameters<ReturnType<typeof loadFacetSetActions>['registerFacet']>[0];
    const payload = {facetId: 'facet', field: 'field'} as Payload;

    it('does not log a deprecation warning when the payload has no #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());

      loadFacetSetActions(engine).registerFacet(payload);

      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('does not throw nor log a deprecation warning when the payload is missing', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadFacetSetActions(engine);

      expect(() => actions.registerFacet(undefined as unknown as Payload)).not.toThrow();
      expect(() => actions.registerFacet(null as unknown as Payload)).not.toThrow();
      expect(engine.logger.warn).not.toHaveBeenCalled();
    });

    it('logs a deprecation warning once per engine when the payload has an #activeTab', () => {
      const engine = buildMockSearchEngine(createMockState());
      const actions = loadFacetSetActions(engine);

      actions.registerFacet({...payload, activeTab: 'tab'});
      actions.registerFacet({...payload, activeTab: 'tab'});

      expect(engine.logger.warn).toHaveBeenCalledOnce();
      expect(engine.logger.warn).toHaveBeenCalledWith(
        expect.stringContaining('The `activeTab` option of `registerFacet`')
      );
    });
  });
});

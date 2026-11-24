import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {loadCoreFacetActions} from './core-facet-actions-loader.js';

describe('#loadCoreFacetActions', () => {
  type CoreFacetActions = ReturnType<typeof loadCoreFacetActions>;
  const facetId = 'facet';

  it('does not log a deprecation warning when the action creators are only loaded', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());

    loadCoreFacetActions(engine);

    expect(engine.logger.warn).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'updateCoreFacetIsFieldExpanded',
      create: (actions: CoreFacetActions) =>
        actions.updateCoreFacetIsFieldExpanded({facetId, isFieldExpanded: true}),
    },
    {
      name: 'updateAutoSelectionForAllCoreFacets',
      create: (actions: CoreFacetActions) =>
        actions.updateAutoSelectionForAllCoreFacets({allow: false}),
    },
  ])('logs a deprecation warning once per engine when #$name is used', ({name, create}) => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());
    const actions = loadCoreFacetActions(engine);

    create(actions);
    create(actions);

    expect(engine.logger.warn).toHaveBeenCalledOnce();
    expect(engine.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(`The commerce \`${name}\` action creator`)
    );
  });

  it('does not log a deprecation warning when the other action creators are used', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());
    const actions = loadCoreFacetActions(engine);

    actions.clearAllCoreFacets();
    actions.deleteAllCoreFacets();
    actions.deselectAllValuesInCoreFacet({facetId});
    actions.updateCoreFacetFreezeCurrentValues({facetId, freezeCurrentValues: true});
    actions.updateCoreFacetNumberOfValues({facetId, numberOfValues: 10});

    expect(engine.logger.warn).not.toHaveBeenCalled();
  });

  it('returns the actions of the original action creators', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());

    const action = loadCoreFacetActions(engine).updateCoreFacetIsFieldExpanded({
      facetId,
      isFieldExpanded: true,
    });

    expect(action.type).toBe('commerce/facets/core/updateIsFieldExpanded');
    expect(action.payload).toEqual({facetId, isFieldExpanded: true});
  });
});

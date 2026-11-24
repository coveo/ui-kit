import {buildMockCommerceDateFacetValue} from '../../../../test/mock-commerce-facet-value.js';
import {buildMockCommerceState} from '../../../../test/mock-commerce-state.js';
import {buildMockCommerceEngine} from '../../../../test/mock-engine-v2.js';
import {loadDateFacetActions} from './date-facet-actions-loader.js';

describe('#loadDateFacetActions', () => {
  type DateFacetActions = ReturnType<typeof loadDateFacetActions>;
  const facetId = 'date-facet';
  const selection = buildMockCommerceDateFacetValue({
    start: '2026/01/01@00:00:00',
    end: '2026/12/31@23:59:59',
  });

  it('does not log a deprecation warning when the action creators are only loaded', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());

    loadDateFacetActions(engine);

    expect(engine.logger.warn).not.toHaveBeenCalled();
  });

  it.each([
    {
      name: 'toggleSelectDateFacetValue',
      create: (actions: DateFacetActions) =>
        actions.toggleSelectDateFacetValue({facetId, selection}),
    },
    {
      name: 'toggleExcludeDateFacetValue',
      create: (actions: DateFacetActions) =>
        actions.toggleExcludeDateFacetValue({facetId, selection}),
    },
    {
      name: 'updateDateFacetValues',
      create: (actions: DateFacetActions) =>
        actions.updateDateFacetValues({facetId, values: [selection]}),
    },
  ])('logs a deprecation warning once per engine when #$name is used', ({name, create}) => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());
    const actions = loadDateFacetActions(engine);

    create(actions);
    create(actions);

    expect(engine.logger.warn).toHaveBeenCalledOnce();
    expect(engine.logger.warn).toHaveBeenCalledWith(
      expect.stringContaining(`The commerce \`${name}\` action creator`)
    );
  });

  it('returns the actions of the original action creators', () => {
    const engine = buildMockCommerceEngine(buildMockCommerceState());

    const action = loadDateFacetActions(engine).toggleSelectDateFacetValue({facetId, selection});

    expect(action.type).toBe('commerce/facets/dateFacet/toggleSelectValue');
    expect(action.payload).toEqual({facetId, selection});
  });
});

import {InsightAppState} from '../../../state/insight-app-state';
import {
  buildMockInsightEngine,
  MockInsightEngine,
} from '../../../test/mock-engine';
import {buildMockInsightState} from '../../../test/mock-insight-state';
import {
  buildInsightCategoryFacet,
  InsightCategoryFacet,
  InsightCategoryFacetOptions,
} from './headless-insight-category-facet';

describe(' insight category facet', () => {
  const facetId = '1';
  let insightCategoryFacet: InsightCategoryFacet;
  let engine: MockInsightEngine;
  let state: InsightAppState;
  let options: InsightCategoryFacetOptions;

  function initInsightCategoryFacet() {
    engine = buildMockInsightEngine({state});
    insightCategoryFacet = buildInsightCategoryFacet(engine, {options});
  }
  beforeEach(() => {
    options = {
      facetId,
      field: 'geography',
    };
    state = buildMockInsightState();
    initInsightCategoryFacet();
  });
});

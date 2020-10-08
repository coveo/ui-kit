import {newSpecPage} from '@stencil/core/testing';
import {AtomicCategoryFacet} from './atomic-category-facet';

describe('atomic-category-facet', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicCategoryFacet],
      html: '<atomic-category-facet></atomic-category-facet>',
    });
    expect(page.root).toBeTruthy();
  });

  it('initializes the facetId prop to a random value containing the type of facet', () => {
    const facetId1 = new AtomicCategoryFacet().facetId;
    const facetId2 = new AtomicCategoryFacet().facetId;

    expect(facetId1).toContain('categoryFacet');
    expect(facetId1).not.toEqual(facetId2);
  });
});

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
});

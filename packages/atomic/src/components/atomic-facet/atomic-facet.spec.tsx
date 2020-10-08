import {newSpecPage} from '@stencil/core/testing';
import {AtomicFacet} from './atomic-facet';

describe('atomic-facet', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicFacet],
      html: '<atomic-facet></atomic-facet>',
    });
    expect(page.root).toBeTruthy();
  });

  it('initializes the facetId prop to a random value containing the type of facet', () => {
    const facetId1 = new AtomicFacet().facetId;
    const facetId2 = new AtomicFacet().facetId;

    expect(facetId1).toContain('facet');
    expect(facetId1).not.toEqual(facetId2);
  });
});

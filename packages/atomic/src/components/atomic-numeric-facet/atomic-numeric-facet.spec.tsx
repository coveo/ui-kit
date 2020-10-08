import {newSpecPage} from '@stencil/core/testing';
import {AtomicNumericFacet} from './atomic-numeric-facet';

describe('atomic-numeric-facet', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicNumericFacet],
      html: '<atomic-numeric-facet></atomic-numeric-facet>',
    });
    expect(page.root).toBeTruthy();
  });

  it('initializes the facetId prop to a random value containing the type of facet', () => {
    const facetId1 = new AtomicNumericFacet().facetId;
    const facetId2 = new AtomicNumericFacet().facetId;

    expect(facetId1).toContain('numericFacet');
    expect(facetId1).not.toEqual(facetId2);
  });
});

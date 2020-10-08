import {newSpecPage} from '@stencil/core/testing';
import {AtomicDateFacet} from './atomic-date-facet';

describe('atomic-date-facet', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicDateFacet],
      html: '<atomic-date-facet></atomic-date-facet>',
    });
    expect(page.root).toBeTruthy();
  });

  it('initializes the facetId prop to a random value containing the type of facet', () => {
    const facetId1 = new AtomicDateFacet().facetId;
    const facetId2 = new AtomicDateFacet().facetId;

    expect(facetId1).toContain('dateFacet');
    expect(facetId1).not.toEqual(facetId2);
  });
});

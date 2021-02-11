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
});

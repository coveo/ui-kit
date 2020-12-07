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
});

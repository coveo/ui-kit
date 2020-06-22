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
});

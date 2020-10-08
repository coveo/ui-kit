import {newSpecPage} from '@stencil/core/testing';
import {AtomicFacetManager} from './atomic-facet-manager';

describe('atomic-facet-manager', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicFacetManager],
      html: '<atomic-facet-manager></atomic-facet-manager>',
    });
    expect(page.root).toBeTruthy();
  });
});

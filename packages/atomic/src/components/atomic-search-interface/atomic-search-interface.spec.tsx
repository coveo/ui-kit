import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from './atomic-search-interface';

describe('atomic-search-interface', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchInterface],
      html: '<atomic-search-interface></atomic-search-interface>',
    });
    expect(page.root).toBeTruthy();
  });
});

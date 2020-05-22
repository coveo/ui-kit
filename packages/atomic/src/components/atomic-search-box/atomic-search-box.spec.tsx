import { newSpecPage } from '@stencil/core/testing';
import { AtomicSearchBox } from './atomic-search-box';

describe('atomic-search-box', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchBox],
      html: `<atomic-search-box></atomic-search-box>`,
    });
    
    expect(page.root).toBeTruthy();
  });
});

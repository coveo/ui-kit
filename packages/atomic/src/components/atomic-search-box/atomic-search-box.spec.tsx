import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from '../atomic-search-interface/atomic-search-interface';
import {AtomicSearchBox} from './atomic-search-box';

describe('atomic-search-box', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchBox, AtomicSearchInterface],
      html: `<atomic-search-interface sample>
        <atomic-search-box></atomic-search-box>
        </atomic-search-interface>`,
    });

    expect(page.root).toBeTruthy();
  });
});

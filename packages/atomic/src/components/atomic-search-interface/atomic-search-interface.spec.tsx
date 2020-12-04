import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from './atomic-search-interface';

describe('atomic-search-interface', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchInterface],
      html: '<atomic-search-interface sample></atomic-search-interface>',
    });
    expect(page.root).toEqualHtml(`
      <atomic-search-interface pipeline="default" sample="" search-hub="default">
        <mock:shadow-root>
          <atomic-relevance-inspector></atomic-relevance-inspector>
          <slot></slot>
        </mock:shadow-root>
      </atomic-search-interface>
    `);
  });
});

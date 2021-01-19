import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchInterface} from './atomic-search-interface';

describe('atomic-search-interface', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchInterface],
      html: '<atomic-search-interface></atomic-search-interface>',
    });
    expect(page.root).toEqualHtml(`
      <atomic-search-interface language="en" pipeline="default" search-hub="default">
        <mock:shadow-root>
          <slot></slot>
        </mock:shadow-root>
      </atomic-search-interface>
    `);
  });
});

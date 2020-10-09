import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchBoxSubmit} from '../atomic-search-box-submit';

describe('atomic-search-box-submit', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchBoxSubmit],
      html: '<atomic-search-box-submit></atomic-search-box-submit>',
    });
    expect(page.root).toEqualHtml(`
      <atomic-search-box-submit>
        <mock:shadow-root></mock:shadow-root>
      </atomic-search-box-submit>
    `);
  });
});

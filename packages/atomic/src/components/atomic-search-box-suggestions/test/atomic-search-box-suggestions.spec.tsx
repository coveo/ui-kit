import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchBoxSuggestions} from '../atomic-search-box-suggestions';

describe('atomic-search-box-suggestions', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchBoxSuggestions],
      html: '<atomic-search-box-suggestions></atomic-search-box-suggestions>',
    });
    expect(page.root).toEqualHtml(`
      <atomic-search-box-suggestions>
        <mock:shadow-root></mock:shadow-root>
      </atomic-search-box-suggestions>
    `);
  });
});

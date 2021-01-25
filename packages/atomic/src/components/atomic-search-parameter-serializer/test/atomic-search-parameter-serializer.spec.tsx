import {newSpecPage} from '@stencil/core/testing';
import {AtomicSearchParameterSerializer} from '../atomic-search-parameter-serializer';

describe('atomic-search-parameter-serializer', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSearchParameterSerializer],
      html:
        '<atomic-search-parameter-serializer></atomic-search-parameter-serializer>',
    });
    expect(page.root).toEqualHtml(`
      <atomic-search-parameter-serializer>
      </atomic-search-parameter-serializer>
    `);
  });
});

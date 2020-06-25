import {newSpecPage} from '@stencil/core/testing';
import {AtomicQuerySummary} from './atomic-query-summary';

describe('atomic-result-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicQuerySummary],
      html: '<atomic-query-summary></atomic-query-summary>',
    });
    expect(page.root).toBeTruthy();
  });
});

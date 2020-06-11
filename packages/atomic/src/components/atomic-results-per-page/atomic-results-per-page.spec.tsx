import {newSpecPage} from '@stencil/core/testing';
import {AtomicResultsPerPage} from './atomic-results-per-page';

describe('atomic-results-per-page', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicResultsPerPage],
      html: '<atomic-results-per-page></atomic-results-per-page>',
    });
    expect(page.root).toBeTruthy();
  });
});

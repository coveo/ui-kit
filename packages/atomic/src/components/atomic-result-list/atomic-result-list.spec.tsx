import { newSpecPage } from '@stencil/core/testing';
import { AtomicResultList } from './atomic-result-list';

describe('atomic-result-list', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicResultList],
      html: `<atomic-result-list></atomic-result-list>`,
    });
    expect(page.root).toBeTruthy();
  });
});

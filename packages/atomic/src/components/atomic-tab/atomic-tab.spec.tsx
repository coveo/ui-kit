import {newSpecPage} from '@stencil/core/testing';
import {AtomicTab} from './atomic-tab';

describe('atomic-tab', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicTab],
      html: '<atomic-tab></atomic-tab>',
    });

    expect(page.root).toBeTruthy();
  });
});

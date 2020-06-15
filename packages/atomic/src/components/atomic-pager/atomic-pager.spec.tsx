import {newSpecPage} from '@stencil/core/testing';
import {AtomicPager} from './atomic-pager';

describe('atomic-pager', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicPager],
      html: '<atomic-pager></atomic-pager>',
    });
    expect(page.root).toBeTruthy();
  });
});

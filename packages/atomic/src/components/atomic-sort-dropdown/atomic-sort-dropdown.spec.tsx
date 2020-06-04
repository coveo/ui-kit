import {newSpecPage} from '@stencil/core/testing';
import {AtomicSortDropdown} from './atomic-sort-dropdown';

describe('atomic-sort-dropdown', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicSortDropdown],
      html: '<atomic-sort-dropdown></atomic-sort-dropdown>',
    });

    expect(page.root).toBeTruthy();
  });
});

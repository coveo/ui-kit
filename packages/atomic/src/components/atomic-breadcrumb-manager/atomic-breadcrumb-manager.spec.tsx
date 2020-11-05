import {newSpecPage} from '@stencil/core/testing';
import {AtomicBreadcrumbManager} from './atomic-breadcrumb-manager';

describe('atomic-breadcrumb-manager', () => {
  it('renders', async () => {
    const page = await newSpecPage({
      components: [AtomicBreadcrumbManager],
      html: '<atomic-breadcrumb-manager></atomic-breadcrumb-manager>',
    });
    expect(page.root).toBeTruthy();
  });
});

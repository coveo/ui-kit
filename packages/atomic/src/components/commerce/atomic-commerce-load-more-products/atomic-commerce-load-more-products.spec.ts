import {fixture} from '@/vitest-utils/testing-helpers/fixture';
import {page} from '@vitest/browser/context';
import {html} from 'lit';
import {beforeEach, describe, expect, it} from 'vitest';
import '../atomic-commerce-interface/atomic-commerce-interface';
import './atomic-commerce-load-more-products';

describe('atomic-commerce-load-more-products', () => {
  const locators = {
    get loadMoreProducts() {
      return page.getByTestId('atomic-commerce-load-more-products');
    },
  };

  const setupElement = async () => {
    return fixture(
      html`<atomic-commerce-interface>
        <atomic-commerce-load-more-products
          data-testid="atomic-commerce-load-more-products"
        ></atomic-commerce-load-more-products>
      </atomic-commerce-interface>`
    );
  };

  beforeEach(async () => {
    await setupElement();
  });

  it('should render the component', async () => {
    expect(locators.loadMoreProducts).toBeTruthy();
  });
});

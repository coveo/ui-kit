import type {Product} from '@coveo/headless/ssr-commerce';
import {generateMockProducts} from './mock-products.js';

export const createProductListComponent = (productCount = 5) => {
  const mockProducts = generateMockProducts(productCount);

  function ProductListComponent() {
    return (
      <ul data-testid="product-list">
        {mockProducts.map((product: Product) => (
          <li key={product.ec_product_id} data-testid="product-item">
            {product.ec_name}
          </li>
        ))}
      </ul>
    );
  }

  return {ProductListComponent, mockProducts};
};

export const createTestComponent = (
  testId: string,
  content = 'Test Content'
) => {
  function TestComponent() {
    return <div data-testid={testId}>{content}</div>;
  }
  return TestComponent;
};

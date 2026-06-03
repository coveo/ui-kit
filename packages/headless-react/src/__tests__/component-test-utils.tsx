import {randomUUID} from 'node:crypto';
import type {Result} from '@coveo/headless/ssr';
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

export const createResultListComponent = (resultCount = 5) => {
  const generateMockResult = (): Result => ({
    absentTerms: [],
    clickUri: '',
    excerpt: '',
    excerptHighlights: [],
    firstSentences: '',
    firstSentencesHighlights: [],
    flags: '',
    hasHtmlVersion: false,
    isRecommendation: false,
    isTopResult: false,
    isUserActionView: false,
    percentScore: 0,
    printableUri: '',
    printableUriHighlights: [],
    rankingInfo: null,
    raw: {urihash: ''},
    score: 0,
    searchUid: '',
    summary: null,
    summaryHighlights: [],
    title: `Test Result ${Math.random()}`,
    titleHighlights: [],
    uniqueId: randomUUID(),
    uri: '',
  });

  const mockResults = Array.from({length: resultCount}, generateMockResult);

  function ResultListComponent() {
    return (
      <ul data-testid="result-list">
        {mockResults.map((result: Result) => (
          <li key={result.uniqueId} data-testid="result-item">
            {result.title}
          </li>
        ))}
      </ul>
    );
  }

  return {ResultListComponent, mockResults};
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

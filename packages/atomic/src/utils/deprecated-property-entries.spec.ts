import type {LitElement} from 'lit';
import {describe, expect, it} from 'vitest';
import '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import '@/src/components/commerce/atomic-commerce-recommendation-interface/atomic-commerce-recommendation-interface';
import '@/src/components/commerce/atomic-commerce-search-box/atomic-commerce-search-box';
import '@/src/components/commerce/atomic-product-text/atomic-product-text';
import '@/src/components/insight/atomic-insight-facet/atomic-insight-facet';
import '@/src/components/insight/atomic-insight-interface/atomic-insight-interface';
import '@/src/components/insight/atomic-insight-numeric-facet/atomic-insight-numeric-facet';
import '@/src/components/insight/atomic-insight-timeframe-facet/atomic-insight-timeframe-facet';
import '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface';
import '@/src/components/search/atomic-category-facet/atomic-category-facet';
import '@/src/components/search/atomic-color-facet/atomic-color-facet';
import '@/src/components/search/atomic-did-you-mean/atomic-did-you-mean';
import '@/src/components/search/atomic-facet/atomic-facet';
import '@/src/components/search/atomic-html/atomic-html';
import '@/src/components/search/atomic-no-results/atomic-no-results';
import '@/src/components/search/atomic-numeric-facet/atomic-numeric-facet';
import '@/src/components/search/atomic-rating-facet/atomic-rating-facet';
import '@/src/components/search/atomic-rating-range-facet/atomic-rating-range-facet';
import '@/src/components/search/atomic-result-html/atomic-result-html';
import '@/src/components/search/atomic-result-text/atomic-result-text';
import '@/src/components/search/atomic-search-box/atomic-search-box';
import '@/src/components/search/atomic-search-interface/atomic-search-interface';
import '@/src/components/search/atomic-segmented-facet/atomic-segmented-facet';
import '@/src/components/search/atomic-timeframe-facet/atomic-timeframe-facet';
import type {DeprecatedProperty} from './deprecation-utils';

const tagNames = [
  'atomic-commerce-interface',
  'atomic-commerce-recommendation-interface',
  'atomic-commerce-search-box',
  'atomic-product-text',
  'atomic-insight-facet',
  'atomic-insight-interface',
  'atomic-insight-numeric-facet',
  'atomic-insight-timeframe-facet',
  'atomic-recs-interface',
  'atomic-category-facet',
  'atomic-color-facet',
  'atomic-did-you-mean',
  'atomic-facet',
  'atomic-html',
  'atomic-no-results',
  'atomic-numeric-facet',
  'atomic-rating-facet',
  'atomic-rating-range-facet',
  'atomic-result-html',
  'atomic-result-text',
  'atomic-search-box',
  'atomic-search-interface',
  'atomic-segmented-facet',
  'atomic-timeframe-facet',
];

const deprecatedPropertiesOf = (element: HTMLElement) =>
  (element as unknown as {deprecatedPropertyWarnings: {properties: DeprecatedProperty[]}})
    .deprecatedPropertyWarnings.properties;

describe('deprecated property entries', () => {
  describe.each(tagNames)('%s', (tagName) => {
    const element = document.createElement(tagName);
    const elementClass = customElements.get(tagName) as unknown as typeof LitElement;

    it.each(deprecatedPropertiesOf(element).map((entry) => [entry.property, entry]))(
      'should name a reactive property bound to its attribute for #%s',
      (_, entry) => {
        const options = elementClass.elementProperties.get(entry.property);
        const attribute =
          typeof options?.attribute === 'string' ? options.attribute : entry.property.toLowerCase();

        expect(options).toBeDefined();
        expect(attribute).toBe(entry.attribute);
      }
    );
  });
});

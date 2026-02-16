import { AtomicCommerceInterface } from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import { Decorator, StoryContext } from '@storybook/web-components-vite';
import { html } from 'lit';
import type * as _ from '../../src/components.js';
import { spreadProps } from '@open-wc/lit-helpers';

export const wrapInCommerceInterface = ({
  engineConfig,
  skipFirstRequest,
  type = 'search',
  includeCodeRoot = true,
}: {
  engineConfig?: Partial<CommerceEngineConfiguration>;
  skipFirstRequest?: boolean;
  type?: 'search' | 'product-listing';
  includeCodeRoot?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-interface ${spreadProps(includeCodeRoot?{id:"code-root"}:{})} type="${type}">
      ${story()}
    </atomic-commerce-interface>
  `,
  play: async ({ canvasElement }) => {
    await customElements.whenDefined('atomic-commerce-interface');
    const commerceInterface = canvasElement.querySelector<AtomicCommerceInterface>('atomic-commerce-interface')!;
    await commerceInterface!.initialize({
      ...getSampleCommerceEngineConfiguration(),
      ...engineConfig,
    });
    if (skipFirstRequest) {
      return;
    }
    await commerceInterface!.executeFirstRequest();
  },
});

export const executeFirstRequestHook: (
  context: StoryContext
) => Promise<void> = async ({ canvasElement }) => {
  const commerceInterface = canvasElement.querySelector<AtomicCommerceInterface>('atomic-commerce-interface')!;
  await commerceInterface!.executeFirstRequest();
};

export const hideFacetTypesHook = async (
  facetTypeToKeep: string,
  context: StoryContext
): Promise<void> => {
  const allFacetTypes = [
    'atomic-commerce-facet',
    'atomic-commerce-timeframe-facet',
    'atomic-commerce-numeric-facet',
    'atomic-commerce-category-facet',
  ];

  const facetTypesToHide = allFacetTypes.filter(type => type !== facetTypeToKeep);

  const waitForFacets = () => {
    return new Promise<void>((resolve) => {
      const checkForFacets = () => {
        const facetsContainer = context.canvasElement.querySelector(
          'atomic-commerce-facets'
        );
        if (facetsContainer) {
          const totalFacets = facetTypesToHide.reduce((count, type) => {
            return count + facetsContainer.querySelectorAll(type).length;
          }, 0);

          if (totalFacets > 0) {
            resolve();
            return;
          }
        }
        setTimeout(checkForFacets, 100);
      };
      checkForFacets();
    });
  };

  await waitForFacets();

  const facetsContainer = context.canvasElement.querySelector(
    'atomic-commerce-facets'
  );
  if (facetsContainer) {
    // Hide all facets of other types.
    facetTypesToHide.forEach((facetType) => {
      const facets = facetsContainer.querySelectorAll(facetType);
      facets.forEach((facet) => {
        (facet as HTMLElement).style.display = 'none';
      });
    });

    // Keep only the first instance of the facet type we want to keep.
    const facetsToKeep = facetsContainer.querySelectorAll(facetTypeToKeep);
    facetsToKeep.forEach((facet, index) => {
      if (index > 0) {
        (facet as HTMLElement).style.display = 'none';
      }
    });
  }
};

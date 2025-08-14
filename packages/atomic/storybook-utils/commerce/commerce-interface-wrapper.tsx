import {AtomicCommerceInterface} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit';
import type * as _ from '../../src/components.js';

export const wrapInCommerceInterface = ({
  engineConfig,
  skipFirstRequest,
  type = 'search',
}: {
  engineConfig?: Partial<CommerceEngineConfiguration>;
  skipFirstRequest?: boolean;
  type?: 'search' | 'product-listing';
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-interface type="${type}" data-testid="root-interface">
      ${story()}
    </atomic-commerce-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-commerce-interface');
    const canvas = within(canvasElement);
    const commerceInterface =
      await canvas.findByTestId<AtomicCommerceInterface>('root-interface');
    await step('Render the Commerce Interface', async () => {
      await commerceInterface!.initialize({
        ...getSampleCommerceEngineConfiguration(),
        ...engineConfig,
      });
    });
    if (skipFirstRequest) {
      return;
    }
    await step('Execute the first request', async () => {
      await commerceInterface!.executeFirstRequest();
    });
  },
});

export const playExecuteFirstRequest: (
  context: StoryContext
) => Promise<void> = async ({canvasElement, step}) => {
  const canvas = within(canvasElement);

  const commerceInterface =
    await canvas.findByTestId<AtomicCommerceInterface>('root-interface');
  await step('Execute the first request', async () => {
    await commerceInterface!.executeFirstRequest();
  });
};

export const playHideFacetTypes = async (
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

import {
  CommerceEngineConfiguration,
  getOrganizationEndpoints,
} from '@coveo/headless/commerce';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import type * as _ from '../src/components.d.ts';

const getSampleCommerceEngineConfiguration =
  (): CommerceEngineConfiguration => ({
    accessToken: 'xxc481d5de-16cb-4290-bd78-45345319d94c',
    organizationId: 'barcasportsmcy01fvu',
    organizationEndpoints: getOrganizationEndpoints(
      'barcasportsmcy01fvu',
      'dev'
    ),
    analytics: {
      trackingId: 'sports',
    },
    context: {
      language: 'en',
      country: 'US',
      currency: 'USD',
      view: {
        url: 'https://github.com/coveo/ui-kit',
        referrer: document.referrer,
      },
    },
    cart: {
      items: [
        {
          productId: 'SP01057_00001',
          quantity: 1,
          name: 'Kayaker Canoe',
          price: 800,
        },
        {
          productId: 'SP00081_00001',
          quantity: 1,
          name: 'Bamboo Canoe Paddle',
          price: 120,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
        {
          productId: 'SP04236_00005',
          quantity: 1,
          name: 'Eco-Brave Rashguard',
          price: 33,
        },
      ],
    },
  });

export const wrapInCommerceInterface = ({
  engineConfig,
  skipFirstSearch,
}: {
  engineConfig?: Partial<CommerceEngineConfiguration>;
  skipFirstSearch?: boolean;
}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-commerce-interface data-testid="root-interface">
      ${story()}
    </atomic-commerce-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-commerce-interface');
    const canvas = within(canvasElement);
    const searchInterface =
      await canvas.findByTestId<HTMLAtomicCommerceInterfaceElement>(
        'root-interface'
      );
    await step('Render the Search Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleCommerceEngineConfiguration(),
        ...engineConfig,
      });
    });
    if (skipFirstSearch) {
      return;
    }
    await step('Execute the first search', async () => {
      await searchInterface!.executeFirstRequest();
    });
  },
});

export const playExecuteFirstSearch: (
  context: StoryContext
) => Promise<void> = async ({canvasElement, step}) => {
  const canvas = within(canvasElement);

  const searchInterface =
    await canvas.findByTestId<HTMLAtomicCommerceInterfaceElement>(
      'root-interface'
    );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstRequest();
  });
};

export const playKeepOnlyFirstFacetOfType = (
  facetType: string,
  context: StoryContext
) => {
  const observer = new MutationObserver(() => {
    const childNodes = Array.from(
      context.canvasElement.querySelector('atomic-commerce-facets')
        ?.childNodes || []
    );

    const allFacetsMatching = childNodes.filter((node) => {
      return node.nodeName.toLowerCase() === facetType;
    });

    const allAtomicElementNotOfType = childNodes.filter((node) => {
      return (
        node.nodeName.toLowerCase().indexOf('atomic') !== -1 &&
        node.nodeName.toLowerCase() !== facetType
      );
    });

    allAtomicElementNotOfType.forEach((node) => node.remove());
    allFacetsMatching.slice(1).forEach((node) => node.remove());
  });

  observer.observe(context.canvasElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

export const playKeepOnlyFirstFacetOfType = (
  facetType: string,
  context: StoryContext
) => {
  const observer = new MutationObserver(() => {
    const childNodes = Array.from(
      context.canvasElement.querySelector('atomic-commerce-facets')
        ?.childNodes || []
    );

    const allFacetsMatching = childNodes.filter((node) => {
      return node.nodeName.toLowerCase() === facetType;
    });

    const allAtomicElementNotOfType = childNodes.filter((node) => {
      return (
        node.nodeName.toLowerCase().indexOf('atomic') !== -1 &&
        node.nodeName.toLowerCase() !== facetType
      );
    });

    allAtomicElementNotOfType.forEach((node) => node.remove());
    allFacetsMatching.slice(1).forEach((node) => node.remove());
  });

  observer.observe(context.canvasElement, {
    childList: true,
    subtree: true,
    attributes: true,
  });
};

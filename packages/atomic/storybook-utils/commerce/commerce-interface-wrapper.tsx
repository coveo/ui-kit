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

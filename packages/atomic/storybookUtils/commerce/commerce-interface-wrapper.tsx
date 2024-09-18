import {
  CommerceEngineConfiguration,
  getSampleCommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {TemplateResult} from 'lit-html';
import {html} from 'lit/static-html.js';
import type * as _ from '../../src/components.js';

export const wrapInCommerceInterface = ({
  engineConfig,
  skipFirstSearch,
  type = 'search',
}: {
  engineConfig?: Partial<CommerceEngineConfiguration>;
  skipFirstSearch?: boolean;
  type?: 'search' | 'product-listing';
}): {
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

export const wrapInCommerceProductList = ({
  engineConfig,
  skipFirstSearch,
}: {
  engineConfig?: Partial<CommerceEngineConfiguration>;
  skipFirstSearch?: boolean;
  productListAttributes?: string;
}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => {
  const {play} = wrapInCommerceInterface({
    engineConfig,
    skipFirstSearch,
  });

  const decorator: Decorator = (story) => {
    // lit-html does not support adding expressions to `template` tags
    // https://lit.dev/docs/templates/expressions/#invalid-locations

    const templateTag = document.createElement('template');
    templateTag.innerHTML = `${(story() as TemplateResult).strings.join('')}`;
    templateTag.id = 'code-root';
    return html`
      <atomic-commerce-interface data-testid="root-interface">
        <atomic-layout-section section="products">
          <atomic-commerce-product-list
            display="list"
            density="compact"
            image-size="small"
          >
            <atomic-product-template>${templateTag}</atomic-product-template>
          </atomic-commerce-product-list>
        </atomic-layout-section>
      </atomic-commerce-interface>
    `;
  };
  return {
    decorator,
    play,
  };
};

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

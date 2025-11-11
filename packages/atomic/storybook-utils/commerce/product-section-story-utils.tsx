import type {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type {ItemDisplayLayout} from '@/src/components/common/layout/display-options';
import type {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import {wrapInCommerceProductList} from './commerce-product-list-wrapper';
import {wrapInCommerceInterface} from './commerce-interface-wrapper';
import {wrapInProductTemplateForSections} from './product-template-section-wrapper';

const createDynamicProductListDecorator = (
  display: ItemDisplayLayout
): Decorator => {
  const {decorator} = wrapInCommerceProductList(
    display,
    false,
    display === 'list' ? 'max-width: 100%; width: 768px;' : undefined
  );
  return decorator;
};

const createSectionLayoutDecorator = (): Decorator => {
  return (story, context: StoryContext) => {
    const layout = (context.args.layout || 'list') as ItemDisplayLayout;
    const isGridMode = layout === 'grid';

    return html`
      <style>
        ${isGridMode
          ? `atomic-commerce-product-list::part(result-list) {
            grid-template-columns: 1fr;
            width: 24em;
          }`
          : ''}
      </style>
      ${story()}
    `;
  };
};

export interface ProductSectionStoryConfig {
  includeCodeRoot?: boolean;
  engineConfig?: Partial<CommerceEngineConfiguration>;
}

export const getProductSectionDecorators = (
  config: ProductSectionStoryConfig = {}
): Decorator[] => {
  const {includeCodeRoot = false, engineConfig} = config;

  const {decorator: productTemplateDecorator} =
    wrapInProductTemplateForSections();

  const defaultEngineConfig: Partial<CommerceEngineConfiguration> = {
    preprocessRequest: (request) => {
      const parsed = JSON.parse(request.body as string);
      parsed.perPage = 1;
      request.body = JSON.stringify(parsed);
      return request;
    },
  };

  const {decorator: commerceInterfaceDecorator} = wrapInCommerceInterface({
    engineConfig: engineConfig || defaultEngineConfig,
    includeCodeRoot,
  });

  return [
    productTemplateDecorator,
    (story, context: StoryContext) => {
      const layout = (context.args.layout || 'list') as ItemDisplayLayout;
      return createDynamicProductListDecorator(layout)(story, context);
    },
    commerceInterfaceDecorator,
    createSectionLayoutDecorator(),
  ];
};

export const getProductSectionArgTypes = () => ({
  layout: {
    control: 'radio' as const,
    options: ['list', 'grid'] as const,
    description: 'The display layout for the list',
    table: {
      category: 'Story',
    },
  },
});

export const getProductSectionArgs = () => ({
  layout: 'grid' as ItemDisplayLayout,
});

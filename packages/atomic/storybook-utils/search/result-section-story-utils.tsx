import type {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type {ItemDisplayLayout} from '@/src/components/common/layout/display-options';
import type {SearchEngineConfiguration} from '@coveo/headless';
import {wrapInResultList} from './result-list-wrapper';
import {wrapInSearchInterface} from './search-interface-wrapper';
import {wrapInResultTemplateForSections} from './result-template-section-wrapper';

const createDynamicResultListDecorator = (
  display: ItemDisplayLayout
): Decorator => {
  const {decorator} = wrapInResultList(
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
          ? `atomic-result-list::part(result-list) {
            grid-template-columns: 1fr;
            width: 24em;
          }`
          : ''}
      </style>
      ${story()}
    `;
  };
};

export interface ResultSectionStoryConfig {
  includeCodeRoot?: boolean;
  config?: Partial<SearchEngineConfiguration>;
  skipFirstSearch?: boolean;
}


export const getResultSectionDecorators = (
  config: ResultSectionStoryConfig = {}
): Decorator[] => {
  const {includeCodeRoot = false, config: searchConfig, skipFirstSearch} = config;

  const {decorator: resultTemplateDecorator} =
    wrapInResultTemplateForSections();

  const {decorator: searchInterfaceDecorator} = wrapInSearchInterface({
    config: searchConfig,
    skipFirstSearch,
    includeCodeRoot,
  });

  return [
    resultTemplateDecorator,
    (story, context: StoryContext) => {
      const layout = (context.args.layout || 'list') as ItemDisplayLayout;
      return createDynamicResultListDecorator(layout)(story, context);
    },
    searchInterfaceDecorator,
    createSectionLayoutDecorator(),
  ];
};

export const getResultSectionArgTypes = () => ({
  layout: {
    control: 'radio' as const,
    options: ['list', 'grid'] as const,
    description: 'The display layout for the list',
    table: {
      category: 'Story',
    },
  },
});

export const getResultSectionArgs = () => ({
  layout: 'list' as ItemDisplayLayout,
});;

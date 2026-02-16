import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import { Decorator, StoryContext } from '@storybook/web-components-vite';
import { html } from 'lit';
import type * as _ from '../../src/components.js';
import { spreadProps } from '@open-wc/lit-helpers';
import { AtomicSearchInterface } from '@/src/components/search/atomic-search-interface/atomic-search-interface';

export const wrapInSearchInterface = ({
  config = {},
  skipFirstSearch = false,
  includeCodeRoot = true,
}: {
  config?: Partial<SearchEngineConfiguration>;
  skipFirstSearch?: boolean;
  includeCodeRoot?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-search-interface ${spreadProps(includeCodeRoot ? { id: 'code-root' } : {})}>
      ${story()}
    </atomic-search-interface>
  `,
  play: async ({ canvasElement, step }) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface =
      canvasElement.querySelector<AtomicSearchInterface>(
        'atomic-search-interface'
      );
    await step('Render the Search Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleSearchEngineConfiguration(),
        ...config,
      });
    });
    if (skipFirstSearch) {
      return;
    }
    await step('Execute the first search', async () => {
      await searchInterface!.executeFirstSearch();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  },
});

export const playExecuteFirstSearch: (
  context: StoryContext
) => Promise<void> = async ({ canvasElement, step }) => {
  const searchInterface =
    canvasElement.querySelector<AtomicSearchInterface>(
      'atomic-search-interface'
    );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstSearch();
  });
};

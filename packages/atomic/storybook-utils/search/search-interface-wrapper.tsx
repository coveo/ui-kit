import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type * as _ from '../../src/components.js';

export const wrapInSearchInterface = (
  config: Partial<SearchEngineConfiguration> = {},
  skipFirstSearch = false,
  includeCodeRoot = true
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => includeCodeRoot ? html`
    <atomic-search-interface id="code-root">
      ${story()}
    </atomic-search-interface>
  ` : html`
      <atomic-search-interface>
      ${story()}
    </atomic-search-interface>`,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface =
      canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
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
    });
  },
});

export const playExecuteFirstSearch: (
  context: StoryContext
) => Promise<void> = async ({canvasElement, step}) => {
  const searchInterface =
    canvasElement.querySelector<HTMLAtomicSearchInterfaceElement>(
      'atomic-search-interface'
    );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstSearch();
  });
};

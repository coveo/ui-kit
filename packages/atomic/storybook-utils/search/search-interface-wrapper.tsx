import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import {spreadProps} from '@open-wc/lit-helpers';
import {isTestMode} from '@/storybook-utils/common/is-test-mode';
import type {AtomicSearchInterface} from '@/src/components/search/atomic-search-interface/atomic-search-interface.js';
import '@/src/components/search/atomic-search-interface/atomic-search-interface.js';

export const wrapInSearchInterface = ({
  config = {},
  skipFirstSearch = false,
  includeCodeRoot = true,
  disableStateReflectionInUrl = false,
  analytics = isTestMode(),
}: {
  config?: Partial<SearchEngineConfiguration>;
  skipFirstSearch?: boolean;
  includeCodeRoot?: boolean;
  disableStateReflectionInUrl?: boolean;
  analytics?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-search-interface
      ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
      ?disable-state-reflection-in-url=${disableStateReflectionInUrl}
      .analytics=${analytics}
    >
      ${story()}
    </atomic-search-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface = canvasElement.querySelector<AtomicSearchInterface>(
      'atomic-search-interface'
    )!;
    await step('Render the Search Interface', async () => {
      await searchInterface.initialize({
        ...getSampleSearchEngineConfiguration(),
        ...config,
      });
    });
    if (skipFirstSearch) {
      return;
    }
    await step('Execute the first search', async () => {
      await searchInterface.executeFirstSearch();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  },
});

export const playExecuteFirstSearch: (
  context: StoryContext
) => Promise<void> = async ({canvasElement, step}) => {
  const searchInterface = canvasElement.querySelector<AtomicSearchInterface>(
    'atomic-search-interface'
  );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstSearch();
  });
};

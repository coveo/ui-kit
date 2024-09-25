import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import type * as _ from '../../src/components';

export const wrapInSearchInterface = (
  config?: Partial<SearchEngineConfiguration>,
  skipFirstSearch = false
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-search-interface data-testid="root-interface">
      ${story()}
    </atomic-search-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-search-interface');
    const canvas = within(canvasElement);
    const searchInterface =
      await canvas.findByTestId<HTMLAtomicSearchInterfaceElement>(
        'root-interface'
      );

    const searchProxyUrl = (() => {
      const url = new URL('http://localhost');
      url.search = canvasElement.ownerDocument.location.search;
      return url.searchParams.get('searchProxyUrl');
    })();

    await step('Render the Search Interface', async () => {
      const searchInterfaceOptions = {
        ...getSampleSearchEngineConfiguration(),
        ...config,
      };
      if (searchProxyUrl) {
        searchInterfaceOptions.search = {
          proxyBaseUrl: decodeURIComponent(searchProxyUrl),
        };
      }
      await searchInterface!.initialize(searchInterfaceOptions);
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
  const canvas = within(canvasElement);

  const searchInterface =
    await canvas.findByTestId<HTMLAtomicSearchInterfaceElement>(
      'root-interface'
    );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstSearch();
  });
};

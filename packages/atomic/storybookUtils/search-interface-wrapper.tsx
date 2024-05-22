import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import type * as _ from '../src/components.d.ts';

export const wrapInSearchInterface = (): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-search-interface data-testid="root-interface">
      ${story()}
    </atomic-search-interface>
  `,
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const searchInterface =
      await canvas.findByTestId<HTMLAtomicSearchInterfaceElement>(
        'root-interface'
      );
    await step('Render the Search Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleSearchEngineConfiguration(),
      });
    });
    await step('Execute the first search', async () => {
      await searchInterface!.executeFirstSearch();
    });
  },
});

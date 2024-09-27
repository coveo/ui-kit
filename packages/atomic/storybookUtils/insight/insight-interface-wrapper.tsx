import {InsightEngineConfiguration} from '@coveo/headless/dist/definitions/insight.index';
import {getSampleInsightEngineConfiguration} from '@coveo/headless/insight';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import type * as _ from '../../src/components';

export const wrapInInsightInterface = (
  config?: Partial<InsightEngineConfiguration>,
  skipFirstSearch = false
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <style data-styles>
      atomic-insight-interface:not([widget='false']),
      atomic-insight-layout:not([widget='false']) {
        width: 500px;
        height: 1000px;
        margin-left: auto;
        margin-right: auto;
        box-shadow: 0px 3px 24px 0px #0000001a;
      }
    </style>
    <atomic-insight-interface data-testid="root-interface">
      ${story()}
    </atomic-insight-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-insight-interface');
    const canvas = within(canvasElement);
    const insightInterface =
      await canvas.findByTestId<HTMLAtomicInsightInterfaceElement>(
        'root-interface'
      );
    await step('Render the Insight Interface', async () => {
      await insightInterface!.initialize({
        ...getSampleInsightEngineConfiguration(),
        ...config,
      });
    });
    if (skipFirstSearch) {
      return;
    }
    await step('Execute the first search', async () => {
      await insightInterface!.executeFirstSearch();
    });
  },
});

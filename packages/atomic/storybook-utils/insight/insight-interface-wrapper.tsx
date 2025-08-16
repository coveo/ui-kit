import {
  getSampleInsightEngineConfiguration,
  InsightEngineConfiguration,
} from '@coveo/headless/insight';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type * as _ from '../../src/components.js';  
import { spreadProps } from '@open-wc/lit-helpers';

export const wrapInInsightInterface = (
  config?: Partial<InsightEngineConfiguration>,
  skipFirstSearch = false,
  includeCodeRoot: boolean = true
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
    <atomic-insight-interface ${spreadProps(includeCodeRoot ? { id: "code-root" } : {})}>
      ${story()}
    </atomic-insight-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-insight-interface');
    const insightInterface =
      canvasElement.querySelector<HTMLAtomicInsightInterfaceElement>(
        'atomic-insight-interface'
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

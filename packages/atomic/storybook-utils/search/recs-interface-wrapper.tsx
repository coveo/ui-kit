import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type * as _ from '../../src/components.js';
import {spreadProps} from '@open-wc/lit-helpers';

export const wrapInRecommendationInterface = ({
  config,
  skipFirstQuery = false,
  skipInitialization = false,
  includeCodeRoot = true,
}: {
  config?: Partial<RecommendationEngineConfiguration>;
  skipFirstQuery?: boolean;
  skipInitialization?: boolean;
  includeCodeRoot?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-recs-interface ${spreadProps(includeCodeRoot ? { id: "code-root" } : {})}>
      ${story()}
    </atomic-recs-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-recs-interface');
    const recsInterface =
      canvasElement.querySelector('atomic-recs-interface')!;

    if (!skipInitialization) {
      await step('Render the Recs Interface', async () => {
        await recsInterface!.initialize({
          ...getSampleRecommendationEngineConfiguration(),
          ...config,
        });
      });
    }

    if (skipFirstQuery || skipInitialization) {
      return;
    }

    await step('Execute the first search', async () => {
      await recsInterface.getRecommendations();
    });
  },
});

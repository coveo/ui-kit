import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import {spreadProps} from '@open-wc/lit-helpers';
import type {AtomicRecsInterface} from '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface.js';
import '@/src/components/recommendations/atomic-recs-interface/atomic-recs-interface.js';

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
    <atomic-recs-interface
      ${spreadProps(includeCodeRoot ? {id: 'code-root'} : {})}
    >
      ${story()}
    </atomic-recs-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-recs-interface');
    const recsInterface = canvasElement.querySelector<AtomicRecsInterface>(
      'atomic-recs-interface'
    )!;

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

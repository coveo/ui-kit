import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {Decorator, StoryContext} from '@storybook/web-components-vite';
import {html} from 'lit';
import type * as _ from '../../src/components.js';

export const wrapInRecommendationInterface = ({
  config,
  skipFirstQuery = false,
}: {
  config?: Partial<RecommendationEngineConfiguration>;
  skipFirstQuery?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-recs-interface id="code-root">
      ${story()}
    </atomic-recs-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-recs-interface');
    const recsInterface =
      canvasElement.querySelector<HTMLAtomicRecsInterfaceElement>('atomic-recs-interface')!;
    await step('Render the Recs Interface', async () => {
      await recsInterface!.initialize({
        ...getSampleRecommendationEngineConfiguration(),
        ...config,
      });
    });
    if (skipFirstQuery) {
      return;
    }
    await step('Execute the first search', async () => {
      await recsInterface.getRecommendations();
    });
  },
});

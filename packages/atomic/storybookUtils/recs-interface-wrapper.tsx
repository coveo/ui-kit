import {
  getSampleRecommendationEngineConfiguration,
  RecommendationEngineConfiguration,
} from '@coveo/headless/recommendation';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html} from 'lit/static-html.js';
import type * as _ from '../src/components';

export const wrapInRecommendationInterface = (
  config?: Partial<RecommendationEngineConfiguration>
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-recs-interface data-testid="root-interface">
      ${story()}
    </atomic-recs-interface>
  `,
  play: async ({canvasElement, step}) => {
    await customElements.whenDefined('atomic-recs-interface');
    const canvas = within(canvasElement);
    const searchInterface =
      await canvas.findByTestId<HTMLAtomicRecsInterfaceElement>(
        'root-interface'
      );
    await step('Render the Recs Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleRecommendationEngineConfiguration(),
        ...config,
      });
    });
    await step('Execute the first search', async () => {
      await searchInterface!.getRecommendations();
    });
  },
});

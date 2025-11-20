import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import { Decorator, StoryContext } from '@storybook/web-components-vite';
import { html } from 'lit';
import type * as _ from '../../src/components.js';
import { spreadProps } from '@open-wc/lit-helpers';
import { AtomicSearchInterface } from '@/src/components/search/atomic-search-interface/atomic-search-interface';

export const wrapInSearchInterface = ({
  config = {},
  skipFirstSearch = false,
  includeCodeRoot = true,
}: {
  config?: Partial<SearchEngineConfiguration>;
  skipFirstSearch?: boolean;
  includeCodeRoot?: boolean;
} = {}): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => html`
    <atomic-search-interface ${spreadProps(includeCodeRoot ? { id: 'code-root' } : {})} pipeline="RGA Coveo Docs">
      ${story()}
    </atomic-search-interface>
  `,
  play: async ({ canvasElement, step }) => {
    await customElements.whenDefined('atomic-search-interface');
    const searchInterface =
      canvasElement.querySelector<AtomicSearchInterface>(
        'atomic-search-interface'
      );
    await step('Render the Search Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleSearchEngineConfiguration(),
        organizationId: 'lbergeronsfdevt1z2624x',
        environment: 'dev',
        accessToken: 'eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyR3JvdXBzIjpbIlN5c3RlbSBBZG1pbmlzdHJhdG9yIl0sInY4Ijp0cnVlLCJ0b2tlbklkIjoidnZtbzVtZW5vcXhhdnRmazJtbzIyYjJkZWEiLCJvcmdhbml6YXRpb24iOiJsYmVyZ2Vyb25zZmRldnQxejI2MjR4IiwidXNlcklkcyI6W3sidHlwZSI6IlVzZXIiLCJuYW1lIjoibW1pdGljaGVAY292ZW8uY29tIiwicHJvdmlkZXIiOiJFbWFpbCBTZWN1cml0eSBQcm92aWRlciJ9XSwicm9sZXMiOlsicXVlcnlFeGVjdXRvciJdLCJpc3MiOiJTZWFyY2hBcGkiLCJleHAiOjE3NjM2ODU2MzUsImlhdCI6MTc2MzU5OTIzNX0.je-dhhYQcnjgdbtMsVVIx4JuRuMub2eOT5eoN7c-K00',
        ...config,
      });
    });
    if (skipFirstSearch) {
      return;
    }
    await step('Execute the first search', async () => {
      await searchInterface!.executeFirstSearch();
      await new Promise((resolve) => requestAnimationFrame(resolve));
    });
  },
});

export const playExecuteFirstSearch: (
  context: StoryContext
) => Promise<void> = async ({ canvasElement, step }) => {
  const searchInterface =
    canvasElement.querySelector<AtomicSearchInterface>(
      'atomic-search-interface'
    );
  await step('Execute the first search', async () => {
    await searchInterface!.executeFirstSearch();
  });
};

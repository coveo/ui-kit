import {
  SearchEngineConfiguration,
  getSampleSearchEngineConfiguration,
} from '@coveo/headless';
import {within} from '@storybook/test';
import {Decorator, StoryContext} from '@storybook/web-components';
import {html, render} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type * as _ from '../src/components.js';

interface Request extends RequestInit {
  url: string;
}

const preprocessRequestForOneResult = (r: Request) => {
  if (
    (r.headers as unknown as Record<string, string>)['Content-Type'] ===
    'application/json'
  ) {
    const bodyParsed = JSON.parse(r.body as string);
    bodyParsed.numberOfResults = 1;
    r.body = JSON.stringify(bodyParsed);
  }
  return r;
};

export const wrapInResult = (
  config?: Partial<SearchEngineConfiguration>
): {
  decorator: Decorator;
  play: (context: StoryContext) => Promise<void>;
} => ({
  decorator: (story) => {
    const tempResultTemplate = document.createElement('div');
    render(html`${story()}`, tempResultTemplate);
    tempResultTemplate.replaceChildren(
      ...Array.from(tempResultTemplate.children)
    );
    return html`
      <atomic-search-interface data-testid="root-interface">
        <div style="position: relative; margin-top: 20px;">
          <atomic-result-list
            display="list"
            density="normal"
            image-size="icon"
            style="border: 2px dashed black; padding:20px; position: relative;"
          >
            <atomic-result-template results>
              ${unsafeHTML(
                `<template>${tempResultTemplate.innerHTML}</template>`
              )}
            </atomic-result-template>
          </atomic-result-list>
          <div style="position: absolute; top: -20px; right: 0;">Template</div>
        </div>
        <style>
          atomic-search-interface,
          atomic-result-list {
            max-width: 1024px;
            display: block;
            margin: auto;
          }
        </style>
      </atomic-search-interface>
    `;
  },
  play: async ({canvasElement, step}) => {
    const canvas = within(canvasElement);
    const searchInterface =
      await canvas.findByTestId<HTMLAtomicSearchInterfaceElement>(
        'root-interface'
      );
    await step('Render the Search Interface', async () => {
      await searchInterface!.initialize({
        ...getSampleSearchEngineConfiguration(),
        ...{preprocessRequest: preprocessRequestForOneResult},
        ...config,
      });
    });
    await step('Execute the first search', async () => {
      await searchInterface!.executeFirstSearch();
    });
  },
});

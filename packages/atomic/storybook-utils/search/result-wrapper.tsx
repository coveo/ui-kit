import '@/src/components/search/atomic-result-list/atomic-result-list.js';
import '@/src/components/search/atomic-result-template/atomic-result-template.js';
import {SearchEngineConfiguration} from '@coveo/headless';
import {Decorator} from '@storybook/web-components-vite';
import {html, render} from 'lit';
import type * as _ from '../../src/components.js';

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
  engineConfig?: Partial<SearchEngineConfiguration>
): {
  decorator: Decorator;
  engineConfig: Partial<SearchEngineConfiguration>;
} => ({
  decorator: (story) => {
    const tempResultTemplate = document.createElement('div');
    render(html`${story()}`, tempResultTemplate);
    tempResultTemplate.replaceChildren(
      ...Array.from(tempResultTemplate.children)
    );
    return html`
      <div style="position: relative; margin-top: 20px;">
        <atomic-result-list
          display="list"
          density="normal"
          image-size="icon"
          style="border: 2px dashed black; padding:20px; position: relative;"
        >
          <atomic-result-template results>
            <template>${html(tempResultTemplate.innerHTML)}</template>
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
      <div style="hidden">${html(tempResultTemplate.innerHTML)}</div>
    `;
  },
  engineConfig: {
    preprocessRequest: preprocessRequestForOneResult,
    ...engineConfig,
  },
});

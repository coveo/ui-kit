import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import {Decorator} from '@storybook/web-components';
import {render} from 'lit-html';
import {html} from 'lit-html/static.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

export const wrapInProduct = (
  engineConfig?: Partial<CommerceEngineConfiguration>
): {
  decorator: Decorator;
  engineConfig: Partial<CommerceEngineConfiguration>;
} => ({
  decorator: (story) => {
    const tempResultTemplate = document.createElement('div');
    render(html`${story()}`, tempResultTemplate);
    tempResultTemplate.replaceChildren(
      ...Array.from(tempResultTemplate.children)
    );
    return html`
      <div style="position: relative; margin-top: 20px;">
        <atomic-commerce-product-list
          display="grid"
          density="compact"
          image-size="small"
          style="border: 2px dashed black; padding:20px; position: relative;"
        >
          <atomic-product-template>
            ${unsafeHTML(
              `<template>${tempResultTemplate.innerHTML}</template>`
            )}
          </atomic-product-template>
        </atomic-commerce-product-list>
        <div style="position: absolute; top: -20px; right: 0;">
          Product template
        </div>
      </div>

      <div style="hidden">${unsafeHTML(tempResultTemplate.innerHTML)}</div>
    `;
  },
  engineConfig: {
    preprocessRequest: (r) => {
      const parsed = JSON.parse(r.body as string);
      parsed.query = 'SP04970_00007';
      r.body = JSON.stringify(parsed);
      return r;
    },
    ...engineConfig,
  },
});

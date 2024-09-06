import {CommerceEngineConfiguration} from '@coveo/headless/commerce';
import {Decorator} from '@storybook/web-components';
import {render} from 'lit-html';
import {html} from 'lit-html/static.js';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';

interface Request extends RequestInit {
  url: string;
}

const preprocessRequestForOneResult = (r: Request) => {
  if (
    (r.headers as unknown as Record<string, string>)['Content-Type'] ===
    'application/json'
  ) {
    const bodyParsed = JSON.parse(r.body as string);
    bodyParsed.perPage = 1;
    r.body = JSON.stringify(bodyParsed);
  }
  return r;
};

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
          display="list"
          density="normal"
          image-size="icon"
          style="border: 2px dashed black; padding:20px; position: relative;"
        >
          <atomic-product-template products>
            ${unsafeHTML(
              `<template>${tempResultTemplate.innerHTML}</template>`
            )}
          </atomic-product-template>
        </atomic-commerce-product-list>
        <div style="position: absolute; top: -20px; right: 0;">Template</div>
      </div>
      <style>
        atomic-commerce-interface,
        atomic-commerce-product-list {
          max-width: 1024px;
          display: block;
          margin: auto;
        }
      </style>
      <div style="hidden">${unsafeHTML(tempResultTemplate.innerHTML)}</div>
    `;
  },
  engineConfig: {
    preprocessRequest: preprocessRequestForOneResult,
    ...engineConfig,
  },
});

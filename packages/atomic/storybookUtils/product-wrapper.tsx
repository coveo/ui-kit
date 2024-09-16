import {Decorator} from '@storybook/web-components';
import {html, render} from 'lit';
import {unsafeHTML} from 'lit/directives/unsafe-html.js';
import type * as _ from '../src/components.js';

export const wrapInProduct = (): {
  decorator: Decorator;
} => ({
  decorator: (story) => {
    const tempProductTemplate = document.createElement('div');
    render(html`${story()}`, tempProductTemplate);
    tempProductTemplate.replaceChildren(
      ...Array.from(tempProductTemplate.children)
    );
    return html`
      <div style="position: relative; margin-top: 20px;">
        <atomic-commerce-product-list
          display="list"
          density="normal"
          image-size="icon"
          style="border: 2px dashed black; padding:20px; position: relative;"
        >
          <atomic-product-template>
            ${unsafeHTML(
              `<template>${tempProductTemplate.innerHTML}</template>`
            )}
          </atomic-product-template>
        </atomic-commerce-product-list>
        <atomic-commerce-products-per-page
          choices-displayed="1"
          initial-choice="1"
        ></atomic-commerce-products-per-page>
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
    `;
  },
});

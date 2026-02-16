import {Decorator} from '@storybook/web-components-vite';
import {html, nothing} from 'lit';

export const facetDecorator: Decorator = (story, context) => html`
  <style>
    ${context.componentId} {
      max-width: 500px;
      margin: auto;
    }
  </style>
  ${story()}
`;

type Position = 'before' | 'after';


export const withFacetContainer: Decorator = (story) =>
  html`<div style="min-width: 470px;"><h1>Test</h1>${story()}</div> `;

export const withRegularFacet: (position: Position) => Decorator =
  (position) => (story) =>
    html`
    ${html`${position === 'after' ? story() : nothing}`}
    <atomic-facet
      field="filetype"
      label="File Type"
      data-testid="regular-facet"
    ></atomic-facet>
    ${html`${position === 'before' ? story() : nothing}`}`;

export const withBreadboxDecorator: (position: Position) => Decorator =
  (position) => (story) =>
    html`
    ${html`${position === 'after' ? story() : nothing}`}
    <atomic-breadbox data-testid="breadbox"></atomic-breadbox>
    ${html`${position === 'before' ? story() : nothing}`}`;
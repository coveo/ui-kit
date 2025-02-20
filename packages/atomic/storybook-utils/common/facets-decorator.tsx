import {Decorator} from '@storybook/web-components';
import {html} from 'lit';

export const facetDecorator: Decorator = (story, context) => html`
  <style>
    ${context.componentId} {
      max-width: 500px;
      margin: auto;
    }
  </style>
  ${story()}
`;

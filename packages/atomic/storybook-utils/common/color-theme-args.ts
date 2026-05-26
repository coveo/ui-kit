import type {ArgTypes, Args, Decorator} from '@storybook/web-components-vite';
import {html} from 'lit';

export const colorArgs: Args = {
  primary: '#126ce0',
  neutral: '#e5e8e8',
  success: '#12a244',
  error: '#ce3f00',
  visited: '#752e9c',
};

export const colorArgTypes: ArgTypes = {
  primary: {
    name: '--atomic-primary',
    control: 'color',
    table: {category: 'Theme Colors'},
  },
  neutral: {
    name: '--atomic-neutral',
    control: 'color',
    table: {category: 'Theme Colors'},
  },
  success: {
    name: '--atomic-success',
    control: 'color',
    table: {category: 'Theme Colors'},
  },
  error: {
    name: '--atomic-error',
    control: 'color',
    table: {category: 'Theme Colors'},
  },
  visited: {
    name: '--atomic-visited',
    control: 'color',
    table: {category: 'Theme Colors'},
  },
};

export const colorDecorator: Decorator = (story, {args}) => {
  const {primary, neutral, success, error, visited} = args;
  return html`
    <style>
      :root {
        --atomic-primary: ${primary};
        --atomic-neutral: ${neutral};
        --atomic-success: ${success};
        --atomic-error: ${error};
        --atomic-visited: ${visited};
      }
    </style>
    ${story()}
  `;
};

import type {Args, StoryContext} from '@storybook/web-components';
import {html, unsafeStatic} from 'lit/static-html.js';

export const parseSlots = (args: Args, slotsControls: string[]) =>
  `${slotsControls.map((slotName) =>
    slotName === 'default'
      ? args[slotName]
      : `<template slot="${slotName}">${args[slotName]}</template>`
  )}`;

export const renderComponent = (args: Args, context: StoryContext) => {
  const shadowPartArgs: string[] = [];
  const attributeControls: string[] = [];
  const slotsControls: string[] = [];
  for (const argKey of Object.keys(args)) {
    switch (context.argTypes[argKey].table?.category) {
      case 'css shadow parts':
        shadowPartArgs.push(argKey);
        break;
      case 'attributes':
        attributeControls.push(argKey);
        break;
      case 'slots':
        slotsControls.push(argKey);
        break;
    }
  }
  return html`<div id="code-root"><style>
        ${unsafeStatic(
          shadowPartArgs
            .map(
              (arg) =>
                `atomic-breadbox::part(${arg}) {${Object.entries(args[arg])
                  .map(([key, value]) => `${key}: ${value}`)
                  .join(';')}}`
            )
            .join('\n')
        )}
      </style>
      <${unsafeStatic(context.componentId)}	
        ${unsafeStatic(attributeControls.map((arg) => `${arg}="${args[arg]}"`).join('\n'))}
      >${unsafeStatic(parseSlots(args, slotsControls))}
      </${unsafeStatic(context.componentId)}></div>`;
};

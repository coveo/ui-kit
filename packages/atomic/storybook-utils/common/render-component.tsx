import type {Args, StoryContext} from '@storybook/web-components-vite';
import {html, unsafeStatic} from 'lit/static-html.js';

export const unfurlArg = (arg: string) => arg.slice(arg.indexOf('-') + 1);

export const parseSlots = (args: Args, slotsControls: string[]) =>
  `${slotsControls.map((slotName) => {
    const unfurledSlotName = unfurlArg(slotName);
    return unfurledSlotName === 'default'
      ? args[slotName]
      : `<template slot="${unfurledSlotName}">${args[slotName]}</template>`;
  })}`;

const renderComponentInternal =
  (withCodeRoot: boolean) => (args: Args, context: StoryContext) => {
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
        default:
          if (argKey.startsWith('attributes-depends-on-')) {
            attributeControls.push(argKey);
          }
      }
    }
    const styleContent = unsafeStatic(
      shadowPartArgs
        .map(
          (arg) =>
            `${context.componentId}::part(${unfurlArg(arg)}) {${Object.entries(
              args[arg]
            )
              .map(([key, value]) => `${key}: ${value}`)
              .join(';')}}`
        )
        .join('\n')
    );

    if (withCodeRoot) {
      return html`    
      <div id='code-root'>
        <style>
            ${styleContent}
        </style>
          <${unsafeStatic(context.componentId)}	${unsafeStatic(attributeControls.map((arg) => `${unfurlArg(arg)}="${args[arg]}"`).join('\n'))}>
            ${unsafeStatic(parseSlots(args, slotsControls))}
          </${unsafeStatic(context.componentId)}>
      </div>`;
    } else {
      return html`    
        <style>
            ${styleContent}
        </style>
          <${unsafeStatic(context.componentId)}	${unsafeStatic(attributeControls.map((arg) => `${unfurlArg(arg)}="${args[arg]}"`).join('\n'))}>
            ${unsafeStatic(parseSlots(args, slotsControls))}
          </${unsafeStatic(context.componentId)}>
      `;
    }
  };

export const renderComponent = renderComponentInternal(true);
export const renderComponentWithoutCodeRoot = renderComponentInternal(false);

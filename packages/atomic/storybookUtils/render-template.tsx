import type {Args, StoryContext} from '@storybook/web-components';
import {html, unsafeStatic} from 'lit/static-html.js';
import {parseSlots, unfurlArg} from './render-component';

export const renderTemplate = (args: Args, context: StoryContext) => {
  let template: string = '';
  let parent: string = '';
  let parentArgs: string = '';
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
    switch (argKey) {
      case 'template':
        template = args[argKey];
        break;
      case 'parent':
        parent = args[argKey];
        break;
      case 'parentArgs':
        parentArgs = args[argKey].join(' ');
        break;
    }
  }

  return html`
    <div id="code-root">
      <style>
          ${unsafeStatic(
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
          )}
      </style>
      <${unsafeStatic(parent)} ${unsafeStatic(parentArgs)}>
        <${unsafeStatic(context.componentId)}${unsafeStatic(attributeControls.map((arg) => `${unfurlArg(arg)}="${args[arg]}"`).join('\n'))}>
          ${unsafeStatic(parseSlots(args, slotsControls))}
          ${unsafeStatic(template)}
        </${unsafeStatic(context.componentId)}>
      </${unsafeStatic(parent)}>
    </div>`;
};

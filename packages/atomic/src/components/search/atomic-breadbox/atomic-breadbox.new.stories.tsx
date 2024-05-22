import '@coveo/atomic/dist/atomic/atomic.esm.js';
import type {HTMLAtomicSearchInterface} from '@coveo/atomic/dist/types/components';
import {getSampleSearchEngineConfiguration} from '@coveo/headless';
import {h} from '@stencil/core';
import type {Meta, StoryObj} from '@storybook/web-components';
//     `,
//   }
// );
// export default {
//   ...defaultModuleExport,
//   title: 'Atomic/Breadbox',
//   id: 'atomic-breadbox',
// };
// export const Default = exportedStory;
// import type {Meta, StoryObj} from '@storybook/';
import {html} from 'lit-html';
import '../../../../dist/atomic/themes/coveo.css';

// const {defaultModuleExport, exportedStory};
//   'atomic-breadbox',
//   {},
//   {
//     additionalMarkup: () => html`
{
  /* <div style="margin:20px 0">
Select facet value(s) to see the Breadbox component. */
}

// This default export determines where your story goes in the story list
const meta: Meta = {
  component: 'atomic-breadbox',
  title: 'Atomic/Breadbox',
  id: 'atomic-breadbox',
  render: (args, context) => {
    const shadowPartArgs = [];
    const attributeControls = [];
    for (const argKey of Object.keys(args)) {
      switch (context.argTypes[argKey].table.category) {
        case 'css shadow parts':
          shadowPartArgs.push(argKey);
          break;
        case 'attribute':
          attributeControls.push(argKey);
          break;
      }
    }
    return html` <style>
        ${shadowPartArgs
          .map(
            (arg) =>
              `atomic-breadbox::part(${arg}) {${Object.entries(args[arg])
                .map(([key, value]) => `${key}: ${value}`)
                .join(';')}}`
          )
          .join('\n')}
      </style>
      <atomic-breadbox
        ${attributeControls.map((arg) => `${arg}="${args[arg]}"`).join('\n')}
      ></atomic-breadbox>`;
  },
  decorators: [
    (story, context) => html`
      <atomic-search-interface>
        ${story()}
        <div style="margin:20px 0">
          Select facet value(s) to see the Breadbox component.
        </div>
        <div style="display: flex; justify-content: flex-start;">
          <atomic-facet
            field="objecttype"
            style="flex-grow:1"
            label="Object type"
          ></atomic-facet>
          <atomic-facet
            field="filetype"
            style="flex-grow:1"
            label="File type"
          ></atomic-facet>
          <atomic-facet
            field="source"
            style="flex-grow:1"
            label="Source"
          ></atomic-facet>
        </div>
      </atomic-search-interface>
    `,
  ],
  parameters: {
    controls: {expanded: true, hideNoControlsWarning: true},
  },
  play: async ({canvasElement}) => {
    const searchInterface =
      canvasElement.querySelector<HTMLAtomicSearchInterface>(
        'atomic-search-interface'
      );
    await searchInterface!.initialize({
      ...getSampleSearchEngineConfiguration(),
    });
    await searchInterface!.executeFirstSearch();
  },
};

export default meta;
type Story = StoryObj;

export const FirstStory: Story = {
  args: {},
};

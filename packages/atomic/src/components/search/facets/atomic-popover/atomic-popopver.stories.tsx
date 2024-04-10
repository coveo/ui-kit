import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-popover',
  {},
  {
    additionalChildMarkup: () =>
      html` <atomic-facet label="File types" field="filetype"></atomic-facet>`,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/Popover',
  id: 'atomic-popover',
};
export const Default = exportedStory;

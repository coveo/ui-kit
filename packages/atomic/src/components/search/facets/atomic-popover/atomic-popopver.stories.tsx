import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Popover',
  'atomic-popover',
  {},
  {
    additionalChildMarkup: () =>
      html` <atomic-facet label="File types" field="filetype"></atomic-facet>`,
  }
);

export default defaultModuleExport;
export const DefaultPopover = exportedStory;

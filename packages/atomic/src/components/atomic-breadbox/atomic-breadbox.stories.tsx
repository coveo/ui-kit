import defaultStory from '../../../.storybook/default-story';
import BreadboxDoc from './atomic-breadbox.mdx';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/Breadbox',
  'atomic-breadbox',
  {},
  BreadboxDoc,
  {
    additionalMarkup: () =>
      html`
      <div style="margin:20px 0">Select facet value(s) to see the Breadbox component.</div>
      <div style="display: flex; justify-content: flex-start;"> 
        <atomic-facet field="objecttype" style="flex-grow:1" label="Object type"></atomic-facet>
        <atomic-facet field="filetype" style="flex-grow:1" label="File type"></atomic-facet>
        <atomic-facet field="source" style="flex-grow:1" label="Source"></atomic-facet>
      </div>
      `,
  }
);

export default defaultModuleExport;
export const DefaultBreadbox = exportedStory;

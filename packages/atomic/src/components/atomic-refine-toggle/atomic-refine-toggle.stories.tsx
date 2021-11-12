import {html} from 'lit-html';
import defaultStory from '../../../.storybook/default-story';
import RefineToggleDoc from './atomic-refine-toggle.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/RefineToggle',
  'atomic-refine-toggle',
  {},
  RefineToggleDoc,
  {
    additionalMarkup: () => html`
      <div style="display:none;">
        <atomic-facet field="author" label="Authors"></atomic-facet>
        <atomic-facet field="language" label="Language"></atomic-facet>
        <atomic-facet
          field="objecttype"
          label="Type"
          display-values-as="link"
        ></atomic-facet>
        <atomic-facet
          field="year"
          label="Year"
          display-values-as="box"
        ></atomic-facet>
      </div>
    `,
  }
);

export default defaultModuleExport;
export const DefaultRefineToggle = exportedStory;

import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-facet-manager',
  {},
  {
    additionalMarkup: () => html`
      <style>
        atomic-facet-manager {
          width: 500px;
          margin: auto;
          display: block;
        }
      </style>
    `,
    additionalChildMarkup: () => html`
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
    `,
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/FacetManager',
  id: 'atomic-facet-manager',
};
export const Default = exportedStory;

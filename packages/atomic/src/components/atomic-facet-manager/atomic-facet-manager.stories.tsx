import {html} from 'lit-html';
import defaultStory from '../../../.storybook/default-story';
import FacetManagerDoc from './atomic-facet-manager.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/FacetManager',
  'atomic-facet-manager',
  {},
  FacetManagerDoc,
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

export default defaultModuleExport;
export const DefaultFacetManager = exportedStory;

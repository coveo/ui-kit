import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/AutomaticFacetBuilder',
  'atomic-automatic-facet-builder',
  {desiredCount: '3', areCollapsed: 'false'},
  {
    additionalMarkup: () => html`<style>
      atomic-automatic-facet-builder {
        gap: 10px;
        display: flex;
        flex-direction: column;
      }
    </style>`,
  }
);
export default {...defaultModuleExport, title: 'Atomic/AutomaticFacetBuilder'};
export const DefaultAutomaticFacetBuilder = exportedStory;

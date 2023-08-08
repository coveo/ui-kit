import defaultStory from 'atomic-storybook/default-story';
import {html} from 'lit-html';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/AutomaticFacetGenerator',
  'atomic-automatic-facet-generator',
  {desiredCount: '2', areCollapsed: 'false'},
  {
    additionalMarkup: () => html`<div>
      <div style="text-align:center; font-size:18px; margin-top:10px;">
        To modify the shadow parts of these automatic facets, see
        <a
          style="color: #399ffe;"
          href="https://docs.coveo.com/en/atomic/latest/reference/components/atomic-automatic-facet/"
          >documentation</a
        >.
      </div>
      <style>
        atomic-automatic-facet-generator {
          gap: 10px;
          display: flex;
          flex-direction: column;
        }
      </style>
    </div>`,
  }
);
export default {
  ...defaultModuleExport,
  title: 'Atomic/AutomaticFacetGenerator',
};
export const DefaultAutomaticFacetGenerator = exportedStory;

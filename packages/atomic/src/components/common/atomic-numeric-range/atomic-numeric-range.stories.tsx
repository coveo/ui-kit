import defaultStory from 'atomic-storybook/default-story';

const id = 'atomic-numeric-facet-range';
const {defaultModuleExport, exportedStory} = defaultStory(
  id,
  {start: 0, end: 1000},
  {
    parentElement: function () {
      const numericFacet = document.createElement('atomic-numeric-facet');
      numericFacet.setAttribute('field', 'ytviewcount');
      return numericFacet;
    },
  }
);

export default {...defaultModuleExport, title: 'Atomic/NumericFacet/Range'};
export const Default = exportedStory;

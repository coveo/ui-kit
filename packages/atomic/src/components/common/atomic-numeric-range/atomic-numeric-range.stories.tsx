import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-numeric-facet-range',
  {start: 0, end: 1000},
  {
    parentElement: function () {
      const numericFacet = document.createElement('atomic-numeric-facet');
      numericFacet.setAttribute('field', 'ytviewcount');
      return numericFacet;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/NumericFacet/Range',
  id: 'atomic-numeric-facet-range',
};
export const Default = exportedStory;

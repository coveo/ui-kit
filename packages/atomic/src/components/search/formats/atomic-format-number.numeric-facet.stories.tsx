import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-format-number',
  {},
  {
    parentElement: function () {
      const numericFacetElement = document.createElement(
        'atomic-numeric-facet'
      );
      numericFacetElement.setAttribute('field', 'size');
      return numericFacetElement;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/NumericFacet/Format/Number',
  id: 'atomic-format-number-facet',
};
export const Default = exportedStory;

import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-format-unit',
  {unit: 'byte'},
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
  title: 'Atomic/NumericFacet/Format/Unit',
};
export const Default = exportedStory;

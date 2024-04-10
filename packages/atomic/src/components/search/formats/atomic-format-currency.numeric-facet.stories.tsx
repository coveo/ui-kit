import defaultStory from 'atomic-storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'atomic-format-currency',
  {
    currency: 'USD',
  },
  {
    parentElement: function () {
      const numericFacetElement = document.createElement(
        'atomic-numeric-facet'
      );
      numericFacetElement.setAttribute('field', 'sncost');
      return numericFacetElement;
    },
  }
);

export default {
  ...defaultModuleExport,
  title: 'Atomic/NumericFacet/Format/Currency',
};
export const Default = exportedStory;

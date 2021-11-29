import defaultStory from '../../../.storybook/default-story';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet/Format/Unit',
  'atomic-format-unit',
  {unit: 'byte'},
  {
    parentElement: () => {
      const numericFacetElement = document.createElement(
        'atomic-numeric-facet'
      );
      numericFacetElement.setAttribute('field', 'size');
      return numericFacetElement;
    },
  }
);

export default defaultModuleExport;
export const DefaultFormatNumber = exportedStory;

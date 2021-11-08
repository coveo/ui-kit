import defaultStory from '../../../.storybook/default-story';
import FormatUnitDoc from './atomic-format-unit.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet/Format/Unit',
  'atomic-format-unit',
  {unit: 'byte'},
  FormatUnitDoc,
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

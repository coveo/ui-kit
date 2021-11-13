import defaultStory from '../../../.storybook/default-story';
import FormatNumberDoc from './atomic-format-number.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet/Format/Number',
  'atomic-format-number',
  {},
  FormatNumberDoc,
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

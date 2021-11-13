import defaultStory from '../../../.storybook/default-story';
import FormatCurrencyDoc from './atomic-format-currency.mdx';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet/Format/Currency',
  'atomic-format-currency',
  {
    currency: 'USD',
  },
  FormatCurrencyDoc,
  {
    parentElement: () => {
      const numericFacetElement = document.createElement(
        'atomic-numeric-facet'
      );
      numericFacetElement.setAttribute('field', 'sncost');
      return numericFacetElement;
    },
  }
);

export default defaultModuleExport;
export const DefaultFormatCurrency = exportedStory;

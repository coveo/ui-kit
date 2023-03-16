import {defaultStory} from '@coveo/atomic-storybook';

const {defaultModuleExport, exportedStory} = defaultStory(
  'Atomic/NumericFacet/Range',
  'atomic-numeric-range',
  {start: 0, end: 1000},
  {
    parentElement: () => {
      const numericFacet = document.createElement('atomic-numeric-facet');
      numericFacet.setAttribute('field', 'ytviewcount');
      return numericFacet;
    },
  }
);

export default defaultModuleExport;
export const DefaultNumericRange = exportedStory;

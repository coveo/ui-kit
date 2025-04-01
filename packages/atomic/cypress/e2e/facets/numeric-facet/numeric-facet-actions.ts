import {
  TestFixture,
  TagProps,
  generateComponentHTML,
} from '../../../fixtures/test-fixture';
import {NumericFacetSelectors} from './numeric-facet-selectors';

export interface NumericRange {
  start: number;
  end: number;
}
export const defaultNumberOfValues = 8;
export const numericFacetLabel = 'Youtube Views';
export const numericFacetField = 'ytviewcount';
export const numericRanges: NumericRange[] = [
  {
    start: 0,
    end: 1000,
  },
  {
    start: 1000,
    end: 10000,
  },
  {
    start: 10000,
    end: 100000,
  },
];

export const addNumericFacet =
  (props: TagProps = {}, formatTag?: string, formatTagProps?: TagProps) =>
  (env: TestFixture) => {
    const e = generateComponentHTML('atomic-numeric-facet', props);
    if (formatTag && formatTagProps) {
      const formatTagHTML = generateComponentHTML(formatTag, formatTagProps);
      e.append(formatTagHTML);
    }
    env.withElement(e);
  };

export const addNumericFacetWithRange =
  (
    props: TagProps = {},
    ranges: NumericRange[],
    formatTag?: string,
    formatTagProps?: TagProps
  ) =>
  (env: TestFixture) => {
    const e = generateComponentHTML('atomic-numeric-facet', props);
    if (formatTag && formatTagProps) {
      const formatTagHTML = generateComponentHTML(formatTag, formatTagProps);
      e.append(formatTagHTML);
    }
    ranges.forEach((r: NumericRange) => {
      const rangeHTML = generateComponentHTML('atomic-numeric-range', {
        start: `${r.start}`,
        end: `${r.end}`,
      });
      e.append(rangeHTML);
    });

    env.withElement(e);
  };

export function inputMinValue(value: number | string) {
  NumericFacetSelectors.minInput().type(value.toString(), {force: true});
}

export function inputMaxValue(value: number | string) {
  NumericFacetSelectors.maxInput().type(value.toString(), {force: true});
}

export function clickApplyButton(shouldBeSuccessful: boolean) {
  NumericFacetSelectors.clearButton().should('not.exist');
  NumericFacetSelectors.applyButton().click({force: true});
  if (shouldBeSuccessful) {
    NumericFacetSelectors.clearButton().should('exist');
  } else {
    NumericFacetSelectors.inputInvalid().should('exist');
  }
}

export function invokeSubmitButton() {
  NumericFacetSelectors.rangeInput().invoke('submit', (e: Event) => {
    // do not actually submit the form
    e.preventDefault();
    // fail this test
    throw new Error('Form should not submit!');
  });
}

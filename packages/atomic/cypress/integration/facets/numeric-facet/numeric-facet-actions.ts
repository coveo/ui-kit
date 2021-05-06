import {setUpPage} from '../../../utils/setupComponent';

export const numericField = 'size';
export const numericLabel = 'File Size';
export const numericRanges: NumericRange[] = [
  {
    start: 0,
    end: 100000,
  },
  {
    start: 100001,
    end: 1000000,
  },
  {
    start: 1000001,
    end: 10000000,
  },
];

export interface NumericRange {
  start: number;
  end: number;
}

export interface NumericFacetSetupOptions {
  field: string;
  label: string;
  ranges: NumericRange[];
  attributes: string;
  executeFirstSearch: boolean;
}

export function generateDateRangeHtml(numericRanges: NumericRange[] | []) {
  if (!Array.isArray(numericRanges) || !numericRanges.length) {
    return null;
  } else {
    return numericRanges
      .map(
        (r: NumericRange) =>
          `<atomic-numeric-range start=${r.start} end=${r.end} end-inclusive="true"></atomic-numeric-range>`
      )
      .join();
  }
}

export function setupNumericFacet(
  options: Partial<NumericFacetSetupOptions> = {}
) {
  const setupOptions: NumericFacetSetupOptions = {
    attributes: '',
    executeFirstSearch: true,
    field: numericField,
    label: numericLabel,
    ranges: [],
    ...options,
  };
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>     
  <atomic-numeric-facet field="${setupOptions.field}" label="${
      setupOptions.label
    }" ${setupOptions.attributes}>${generateDateRangeHtml(
      setupOptions.ranges
    )}</atomic-numeric-facet>`,
    setupOptions.executeFirstSearch
  );
}

export function revertFormatedNumericFacet(num: string) {
  return Number(num.replace(/,/g, ''));
}

export function convertRangeToFacetValue(
  range: NumericRange,
  valueSeparator?: string
) {
  valueSeparator = valueSeparator ? valueSeparator : ' to ';
  const formatedStartValue = new Intl.NumberFormat().format(
    Number(range.start)
  );
  const formatedEndValue = new Intl.NumberFormat().format(range.end);

  return `${formatedStartValue}${valueSeparator}${formatedEndValue}`;
}

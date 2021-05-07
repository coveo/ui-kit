import {setUpPage} from '../../../utils/setupComponent';

export interface DateRange {
  start: string;
  end: string;
}
export const dateField = 'date';
export const dateLabel = 'Date';

export const dateRanges: DateRange[] = [
  {
    start: '01/01/2006',
    end: '01/01/2011',
  },
  {
    start: '01/01/2011',
    end: '01/01/2015',
  },
  {
    start: '01/01/2015',
    end: '01/01/2021',
  },
];

export interface DateFacetSetupOptions {
  field: string;
  label: string;
  ranges: DateRange[];
  attributes: string;
  executeFirstSearch: boolean;
}

export function generateDateRangeHtml(dateRanges: DateRange[]) {
  return dateRanges
    .map(
      (r: DateRange) =>
        `<atomic-date-range start=${r.start} end=${r.end}></atomic-date-range>`
    )
    .join();
}

export function setupDateFacet(options: Partial<DateFacetSetupOptions> = {}) {
  const setupOptions: DateFacetSetupOptions = {
    attributes: '',
    executeFirstSearch: true,
    field: dateField,
    label: dateLabel,
    ranges: [],
    ...options,
  };
  setUpPage(
    `<atomic-breadcrumb-manager></atomic-breadcrumb-manager>     
  <atomic-date-facet field="${setupOptions.field}" label="${
      setupOptions.label
    }" ${setupOptions.attributes}>${generateDateRangeHtml(
      setupOptions.ranges
    )}</atomic-date-facet>`,
    setupOptions.executeFirstSearch
  );
}

export function revertFormatedDateFacet(date: string) {
  const splitDate = date.split('/');
  const year = splitDate[2];
  const month = splitDate[1];
  const day = splitDate[0];
  return `${year}/${month}/${day}`;
}

export function convertDateToFacetValue(
  range: DateRange,
  valueSeparator?: string
) {
  valueSeparator = valueSeparator ? valueSeparator : ' to ';
  return `${range.start}${valueSeparator}${range.end}`;
}

export function convertDateFormatLabel(date: string, formatType?: string) {
  formatType = formatType ? formatType : 'DD/MM/YYYY';
  const splitDate = date.split('/');
  const year = splitDate[2];
  let month = splitDate[1];
  const day = splitDate[0];
  const generateDate = new Date(Number(year), Number(month) - 1, Number(day));
  switch (formatType) {
    case 'DD/MMM/YYYY': {
      month = generateDate.toLocaleString('en', {month: 'short'});
      return `${day}/${month}/${year}`;
    }
    default:
      return date;
  }
}

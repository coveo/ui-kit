import {orderBy} from 'natural-orderby';
import type {RequestTransformer} from '../_base.js';
import type {FacetSearchResponse} from './facetSearch-response.js';
import type {SearchResponse} from './search-response.js';

interface FacetValueRequest {
  value: string;
  state: 'idle' | 'selected' | 'excluded';
}

interface FacetRequest {
  facetId: string;
  field: string;
  type?: 'specific' | 'numericalRange' | 'dateRange' | 'hierarchical';
  numberOfValues?: number;
  sortCriteria?: string | {type: string; order: string};
  currentValues?: FacetValueRequest[] | NumericRangeValueRequest[];
  isFieldExpanded?: boolean;
  customSort?: string[];
  generateAutomaticRanges?: boolean;
}

interface NumericRangeValueRequest {
  start: number;
  end: number;
  endInclusive: boolean;
  state: 'idle' | 'selected' | 'excluded';
}

interface NumericFacetRequest {
  facetId: string;
  field: string;
  type?: 'specific' | 'numericalRange' | 'dateRange' | 'hierarchical';
  numberOfValues?: number;
  sortCriteria?: string | {type: string; order: string};
  currentValues?: NumericRangeValueRequest[];
  isFieldExpanded?: boolean;
  generateAutomaticRanges?: boolean;
}

interface FacetSearchRequest {
  field: string;
  type: string;
  numberOfValues?: number;
  query?: string;
  captions?: Record<string, string>;
  currentValues?: string[];
  facetId?: string;
}

interface SearchRequestBody {
  facets?: FacetRequest[];
  numberOfResults?: number;
  firstResult?: number;
  q?: string;
}

const FACET_VALUE_POOL: Record<string, string[]> = {
  objecttype: [
    'People',
    'Contact',
    'Variant',
    'Message',
    'Thread',
    'Account',
    'Case',
    'Opportunity',
    'Lead',
    'Campaign',
    'Document',
    'Event',
    'Task',
    'Solution',
    'Product',
    'File',
    'Folder',
    'Report',
    'Dashboard',
    'Attachment',
    'Note',
    'Article',
    'Knowledge',
    'Category',
    'Forum',
    'Post',
    'Comment',
    'Review',
    'Order',
    'Invoice',
    'Payment',
    'Subscription',
  ],
  author: [
    'BBC News',
    'Susan Cook',
    'Martin Laporte',
    'BBCPanorama',
    'democ',
    'Alice Johnson',
    'Bob Smith',
    'Charlie Brown',
    'Diana Prince',
    'Edward Norton',
    'Frank Castle',
    'Grace Lee',
    'Harry Potter',
    'Ivy Chen',
    'Jack Wilson',
    'Kate Davis',
    'Leo Kim',
    'Mary Doe',
    'Nick Brown',
    'Olivia Park',
    'Paul White',
    'Quinn Taylor',
    'Rachel Green',
    'Sam Jones',
    'Tina Garcia',
    'Uma Patel',
    'Vic Lopez',
    'Will Martinez',
    'Xena Rodriguez',
    'Yuki Tanaka',
    'Zara Ahmed',
    'Chris Evans',
  ],
  source: [
    'Coveo Samples - Youtube BBC News',
    'Coveo Sample - Lithium Community',
    'Coveo Samples - Dynamics 365',
    'Sports',
    'Internal Wiki',
    'External Blog',
    'Customer Support',
    'Documentation',
    'Training Materials',
    'Product Updates',
  ],
  year: [
    '2025',
    '2024',
    '2023',
    '2022',
    '2021',
    '2020',
    '2019',
    '2018',
    '2017',
    '2016',
  ],
  month: [
    'April',
    'August',
    'December',
    'February',
    'January',
    'July',
    'June',
    'March',
    'May',
    'November',
    'October',
    'September',
  ],
  cat_available_sizes: [
    'XL',
    'L',
    'M',
    'S',
    'XS',
    'XXL',
    'XXXL',
    '2XL',
    '3XL',
    '4XL',
    '5XL',
    '6',
    '7',
    '8',
    '9',
    '10',
    '11',
    '12',
    '13',
    '14',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
  ],
  ec_brand: [
    'Adidas',
    'Apple',
    'BMW',
    'Calvin Klein',
    'Dell',
    'Estee Lauder',
    'Fendi',
    'Gucci',
    'Hugo Boss',
    'Intel',
    'Jordan',
    'Kellogg',
    'Lenovo',
    'Microsoft',
    'Nike',
    'Oracle',
    'Puma',
    'Quaker',
    'Reebok',
    'Samsung',
    'Tesla',
    'Under Armour',
    'Versace',
    'Walmart',
    'Xerox',
    'Yamaha',
    'Zara',
    'Armani',
    'Burberry',
    'Chanel',
    'Dior',
    'Givenchy',
  ],
  filetype: [
    'PDF',
    'HTML',
    'DOC',
    'XLS',
    'PPT',
    'TXT',
    'CSV',
    'XML',
    'JSON',
    'ZIP',
  ],
  language: [
    'English',
    'French',
    'Spanish',
    'German',
    'Italian',
    'Portuguese',
    'Chinese',
    'Japanese',
  ],
};

function generateGenericValues(field: string, count: number): string[] {
  const values: string[] = [];
  for (let i = 0; i < count; i++) {
    values.push(`${field}_value_${i + 1}`);
  }
  return values;
}

function normalizeSortCriteria(
  raw: string | {type: string; order: string}
): string {
  if (typeof raw === 'string') return raw;
  if (raw.order === 'descending') {
    if (raw.type === 'alphanumeric') return 'alphanumericDescending';
    if (raw.type === 'alphanumericNatural')
      return 'alphanumericNaturalDescending';
  }
  return raw.type || 'automatic';
}

type FacetState = 'idle' | 'selected' | 'excluded';

interface SortableFacetValue {
  value: string;
  state: FacetState;
  numberOfResults: number;
}

function sortFacetValues(
  values: SortableFacetValue[],
  sortCriteria: string,
  customSort?: string[]
): SortableFacetValue[] {
  const customSortSet = customSort ? new Set(customSort) : null;
  let customSorted: typeof values = [];
  let remaining: typeof values = [...values];

  if (customSortSet && customSortSet.size > 0) {
    customSorted = customSort!
      .filter((v) => values.some((sv) => sv.value === v))
      .map((v) => values.find((sv) => sv.value === v)!);
    remaining = values.filter((v) => !customSortSet.has(v.value));
  }

  switch (sortCriteria) {
    case 'alphanumeric':
      remaining = remaining.sort((a, b) => a.value.localeCompare(b.value));
      break;
    case 'alphanumericDescending':
      remaining = remaining.sort((a, b) => b.value.localeCompare(a.value));
      break;
    case 'alphanumericNatural':
      remaining = orderBy(
        remaining,
        [(v: (typeof remaining)[0]) => v.value],
        ['asc']
      );
      break;
    case 'alphanumericNaturalDescending':
      remaining = orderBy(
        remaining,
        [(v: (typeof remaining)[0]) => v.value],
        ['desc']
      );
      break;
    case 'occurrences':
      remaining = remaining.sort(
        (a, b) => b.numberOfResults - a.numberOfResults
      );
      break;
    case 'automatic':
      remaining = remaining.sort(
        (a, b) => b.numberOfResults - a.numberOfResults
      );
      break;
    default:
      break;
  }

  return [...customSorted, ...remaining];
}

function buildFacetResponse(facetRequest: FacetRequest) {
  const {
    facetId,
    field,
    numberOfValues = 8,
    sortCriteria: rawSortCriteria = 'automatic',
    currentValues = [],
    customSort,
  } = facetRequest;

  const sortCriteria = normalizeSortCriteria(rawSortCriteria);
  const pool = FACET_VALUE_POOL[field] || generateGenericValues(field, 40);

  const facetValues = currentValues as FacetValueRequest[];
  const selectedValues = facetValues
    .filter((v) => v.state === 'selected' || v.state === 'excluded')
    .map((v) => v.value);

  let values = pool
    .slice(0, Math.max(numberOfValues, pool.length))
    .map((value, i) => ({
      value,
      state: (selectedValues.includes(value)
        ? facetValues.find((cv) => cv.value === value)?.state || 'idle'
        : 'idle') as 'idle' | 'selected' | 'excluded',
      numberOfResults: Math.max(1000 - i * 30, 10),
    }));

  values = sortFacetValues(values, sortCriteria, customSort);

  const returnedValues = values.slice(0, numberOfValues);
  const moreAvailable = values.length > numberOfValues;

  return {
    facetId,
    field,
    moreValuesAvailable: moreAvailable || pool.length > numberOfValues,
    values: returnedValues,
    indexScore: 0.1,
  };
}

function buildNumericFacetResponse(facetRequest: NumericFacetRequest) {
  const {
    facetId,
    field,
    numberOfValues = 5,
    currentValues = [],
    generateAutomaticRanges,
  } = facetRequest;

  if (
    generateAutomaticRanges &&
    (!currentValues || currentValues.length === 0)
  ) {
    const values = [];
    for (let i = numberOfValues; i >= 1; i--) {
      values.push({
        start: i,
        end: numberOfValues + 1,
        endInclusive: false,
        state: 'idle' as const,
        numberOfResults: Math.floor(Math.random() * 500) + 50,
      });
    }
    return {
      facetId,
      field,
      moreValuesAvailable: false,
      values,
      indexScore: 0.1,
    };
  }

  const values = currentValues.map((cv) => ({
    start: cv.start,
    end: cv.end,
    endInclusive: cv.endInclusive,
    state: cv.state,
    numberOfResults: Math.floor(Math.random() * 500) + 50,
  }));

  return {
    facetId,
    field,
    moreValuesAvailable: false,
    values,
    indexScore: 0.1,
  };
}

/**
 * Request transformer for the search endpoint that dynamically builds facet responses
 * based on the request body. Handles facet selections, sort criteria, show more, etc.
 */
export const searchFacetTransformer: RequestTransformer<SearchResponse> = (
  body,
  response
) => {
  const requestBody = body as SearchRequestBody;
  const facets: unknown[] = [];

  if (requestBody.facets) {
    for (const facetReq of requestBody.facets) {
      if (
        facetReq.type === 'numericalRange' ||
        ('generateAutomaticRanges' in facetReq &&
          facetReq.generateAutomaticRanges)
      ) {
        facets.push(buildNumericFacetResponse(facetReq as NumericFacetRequest));
      } else if (facetReq.type === 'specific' || !facetReq.type) {
        facets.push(buildFacetResponse(facetReq));
      }
    }
  }

  return {
    ...response,
    facets,
  };
};

/**
 * Request transformer for the search facet search endpoint (/rest/search/v2/facet).
 * Returns matching values filtered by the search query.
 */
export const searchFacetSearchTransformer: RequestTransformer<
  FacetSearchResponse
> = (body) => {
  const requestBody = body as FacetSearchRequest;
  const {
    field,
    numberOfValues = 10,
    query = '',
    currentValues = [],
  } = requestBody;
  const pool = FACET_VALUE_POOL[field] || generateGenericValues(field, 40);
  const currentSet = new Set(currentValues);

  const cleanQuery = query.replace(/^\*|\*$/g, '').toLowerCase();

  const filtered = pool.filter(
    (v) => v.toLowerCase().includes(cleanQuery) && !currentSet.has(v)
  );

  const values = filtered.slice(0, numberOfValues).map((v, i) => ({
    displayValue: v,
    rawValue: v,
    count: Math.max(500 - i * 20, 5),
  }));

  return {
    values,
    moreValuesAvailable: filtered.length > numberOfValues,
  };
};

import type {RequestTransformer} from '../_request-transformer.js';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyResponse = Record<string, any>;

interface FacetValueRequest {
  value?: string;
  state?: string;
  start?: number | string;
  end?: number | string;
  endInclusive?: boolean;
  children?: FacetValueRequest[];
  retrieveCount?: number;
}

interface FacetRequest {
  facetId: string;
  field: string;
  type: string;
  values?: FacetValueRequest[];
  numberOfValues?: number;
  initialNumberOfValues?: number;
  freezeCurrentValues?: boolean;
  preventAutoSelect?: boolean;
  isFieldExpanded?: boolean;
  delimitingCharacter?: string;
  retrieveCount?: number;
}

interface RequestBody {
  facets?: FacetRequest[];
  [key: string]: unknown;
}

interface FacetSearchRequestBody {
  facetId?: string;
  facetQuery?: string;
  query?: string;
  numberOfValues?: number;
  [key: string]: unknown;
}

interface ResponseFacetValue {
  state: string;
  numberOfResults: number;
  value?: string;
  start?: number | string;
  end?: number | string;
  endInclusive?: boolean;
  path?: string[];
  isLeafValue?: boolean;
  children?: ResponseFacetValue[];
  moreValuesAvailable?: boolean;
}

interface ResponseFacet {
  type: string;
  facetId: string;
  field: string;
  displayName: string;
  values: ResponseFacetValue[];
  numberOfValues: number;
  moreValuesAvailable: boolean;
  fromAutoSelect: boolean;
  isFieldExpanded: boolean;
  delimitingCharacter?: string;
  interval?: string;
}

type CommerceResponse = AnyResponse & {facets: ResponseFacet[]};

const EXTRA_BRAND_VALUES = [
  'Puma',
  'Reebok',
  'New Balance',
  'Under Armour',
  'Asics',
  'Skechers',
  'Merrell',
  'Salomon',
  'Polo Ralph Lauren',
  'Brooks',
  'Rockport',
  'Volcom',
];

const EXTRA_CATEGORY_VALUES = [
  {value: 'Canoes & Kayaks', path: ['Water Sports'], numberOfResults: 89},
  {value: 'Camping', path: ['Outdoor Activities'], numberOfResults: 156},
  {value: 'Running', path: ['Athletics'], numberOfResults: 234},
  {value: 'Cycling', path: ['Athletics'], numberOfResults: 78},
  {value: 'Swimming', path: ['Water Sports'], numberOfResults: 45},
  {value: 'Outdoor Gear', path: ['Outdoor Activities'], numberOfResults: 312},
  {value: 'Footwear', path: [] as string[], numberOfResults: 567},
  {value: 'Workout Equipment', path: ['Athletics'], numberOfResults: 198},
  {value: 'Yoga & Pilates', path: ['Athletics'], numberOfResults: 87},
  {value: 'Snow Sports', path: ['Outdoor Activities'], numberOfResults: 143},
  {value: 'Snowboarding', path: ['Snow Sports'], numberOfResults: 65},
  {value: 'Rock Climbing', path: ['Outdoor Activities'], numberOfResults: 52},
];

const CATEGORY_CHILDREN: Record<string, string[]> = {
  'Water Sports': ['Canoes & Kayaks', 'Canoes', 'Kayaks', 'Swimming'],
  'Outdoor Activities': ['Camping', 'Hiking', 'Fishing', 'Rock Climbing'],
  Athletics: ['Running', 'Cycling', 'Track & Field', 'Yoga & Pilates'],
  'Canoes & Kayaks': ['Canoes', 'Kayaks', 'Paddles'],
  Accessories: ['Bags', 'Hats', 'Sunglasses'],
  Clothing: ['Shirts', 'Pants', 'Jackets'],
  'Sandals & Shoes': ['Sandals', 'Running Shoes', 'Hiking Boots'],
  Canoes: ['Classic', 'Inflatable', 'Fishing'],
  Kayaks: ['Touring', 'Whitewater', 'Recreational'],
  Classic: ['Solo', 'Tandem'],
  'Snow Sports': ['Snowboarding', 'Skiing', 'Ice Skating'],
  Footwear: ['Running Shoes', 'Hiking Boots', 'Sandals'],
};

function applyFacetSelections(
  responseFacets: ResponseFacet[],
  requestFacets: FacetRequest[]
): ResponseFacet[] {
  return responseFacets.map((resFacet) => {
    const reqFacet = requestFacets.find(
      (rf) => rf.facetId === resFacet.facetId
    );
    if (!reqFacet) return resFacet;

    const updatedFacet = {...resFacet};

    if (reqFacet.type === 'hierarchical') {
      updatedFacet.values = applyHierarchicalSelection(
        resFacet,
        reqFacet.values || [],
        reqFacet.preventAutoSelect ?? false
      );
    } else if (reqFacet.type === 'regular') {
      updatedFacet.values = applyRegularSelection(
        resFacet,
        reqFacet.values || [],
        reqFacet.numberOfValues
      );
    } else if (
      reqFacet.type === 'numericalRange' ||
      reqFacet.type === 'dateRange'
    ) {
      updatedFacet.values = applyRangeSelection(
        resFacet,
        reqFacet.values || []
      );
    }

    if (
      reqFacet.numberOfValues &&
      reqFacet.numberOfValues > resFacet.values.length
    ) {
      updatedFacet.numberOfValues = reqFacet.numberOfValues;
      updatedFacet.values = expandValues(updatedFacet, reqFacet.numberOfValues);
    }

    return updatedFacet;
  });
}

function applyRegularSelection(
  resFacet: ResponseFacet,
  reqValues: FacetValueRequest[],
  numberOfValues?: number
): ResponseFacetValue[] {
  const selectedValues = reqValues.filter((v) => v.state === 'selected');
  const currentValues = [...resFacet.values];

  for (const reqVal of selectedValues) {
    const existing = currentValues.find((v) => v.value === reqVal.value);
    if (existing) {
      existing.state = 'selected';
    } else {
      currentValues.push({
        state: 'selected',
        numberOfResults: 10,
        value: reqVal.value,
      });
    }
  }

  const idleValues = reqValues.filter((v) => v.state === 'idle');
  for (const reqVal of idleValues) {
    const existing = currentValues.find((v) => v.value === reqVal.value);
    if (existing) {
      existing.state = 'idle';
    }
  }

  if (numberOfValues && numberOfValues > currentValues.length) {
    return currentValues;
  }

  return currentValues;
}

function applyRangeSelection(
  resFacet: ResponseFacet,
  reqValues: FacetValueRequest[]
): ResponseFacetValue[] {
  const values = resFacet.values.map((v) => ({...v}));
  for (const reqVal of reqValues) {
    if (reqVal.state === 'selected') {
      const matching = values.find(
        (v) =>
          String(v.start) === String(reqVal.start) &&
          String(v.end) === String(reqVal.end)
      );
      if (matching) {
        matching.state = 'selected';
      } else {
        values.push({
          state: 'selected',
          numberOfResults: 5,
          start: reqVal.start,
          end: reqVal.end,
          endInclusive: reqVal.endInclusive ?? false,
        });
      }
    }
  }
  return values;
}

function applyHierarchicalSelection(
  resFacet: ResponseFacet,
  reqValues: FacetValueRequest[],
  preventAutoSelect: boolean
): ResponseFacetValue[] {
  const selectedNodes = findAllSelectedNodes(reqValues);
  if (selectedNodes.length === 0) return resFacet.values;

  const deepest = selectedNodes.reduce((a, b) => (a.depth > b.depth ? a : b));
  const selectedValue = deepest.node.value!;

  if (preventAutoSelect && deepest.parentValue) {
    const knownSiblings = CATEGORY_CHILDREN[deepest.parentValue];
    // Only navigate up if the selected value is a known child of its parent.
    // Unknown values (e.g., from URL restoration) are kept as-is.
    if (knownSiblings && knownSiblings.includes(selectedValue)) {
      const parentNode: SelectedNodeInfo = {
        node: {value: deepest.parentValue, state: 'selected', children: []},
        depth: deepest.depth - 1,
        parentValue:
          deepest.ancestorPath[deepest.ancestorPath.length - 2] ?? null,
        ancestorPath: deepest.ancestorPath.slice(0, -1),
      };
      return buildHierarchicalTree(
        reqValues,
        parentNode,
        knownSiblings,
        resFacet
      );
    }
  }

  const children = CATEGORY_CHILDREN[selectedValue] || ['SubItem1', 'SubItem2'];
  return buildHierarchicalTree(reqValues, deepest, children, resFacet);
}

interface SelectedNodeInfo {
  node: FacetValueRequest;
  depth: number;
  parentValue: string | null;
  ancestorPath: string[];
}

function findAllSelectedNodes(
  values: FacetValueRequest[],
  depth = 0,
  parentValue: string | null = null,
  ancestorPath: string[] = []
): SelectedNodeInfo[] {
  const results: SelectedNodeInfo[] = [];
  for (const v of values) {
    if (v.state === 'selected') {
      results.push({
        node: v,
        depth,
        parentValue,
        ancestorPath: [...ancestorPath],
      });
    }
    if (v.children && v.children.length > 0) {
      results.push(
        ...findAllSelectedNodes(v.children, depth + 1, v.value || null, [
          ...ancestorPath,
          v.value!,
        ])
      );
    }
  }
  return results;
}

function buildHierarchicalTree(
  _reqValues: FacetValueRequest[],
  deepest: SelectedNodeInfo,
  deepestChildren: string[],
  resFacet: ResponseFacet
): ResponseFacetValue[] {
  const selectedValue = deepest.node.value!;
  const fullPath = [...deepest.ancestorPath, selectedValue];

  if (fullPath.length === 1) {
    return [
      {
        state: 'selected',
        numberOfResults:
          resFacet.values.find((v) => v.value === selectedValue)
            ?.numberOfResults || 100,
        value: selectedValue,
        path: [selectedValue],
        isLeafValue: false,
        moreValuesAvailable: false,
        children: deepestChildren.map((child) => ({
          state: 'idle',
          numberOfResults: Math.floor(Math.random() * 50) + 10,
          value: child,
          path: [selectedValue, child],
          isLeafValue: false,
          children: [],
          moreValuesAvailable: false,
        })),
      },
    ];
  }

  const buildLevel = (pathIndex: number): ResponseFacetValue[] => {
    const value = fullPath[pathIndex];
    const isDeepest = pathIndex === fullPath.length - 1;
    const currentPath = fullPath.slice(0, pathIndex + 1);

    if (isDeepest) {
      return [
        {
          state: 'selected',
          numberOfResults:
            resFacet.values.find((v) => v.value === value)?.numberOfResults ||
            100,
          value,
          path: currentPath,
          isLeafValue: false,
          moreValuesAvailable: false,
          children: deepestChildren.map((child) => ({
            state: 'idle',
            numberOfResults: Math.floor(Math.random() * 50) + 10,
            value: child,
            path: [...currentPath, child],
            isLeafValue: false,
            children: [],
            moreValuesAvailable: false,
          })),
        },
      ];
    }

    return [
      {
        state: 'idle',
        numberOfResults: 100,
        value,
        path: currentPath,
        isLeafValue: false,
        moreValuesAvailable: false,
        children: buildLevel(pathIndex + 1),
      },
    ];
  };

  return buildLevel(0);
}

function expandValues(
  facet: ResponseFacet,
  targetCount: number
): ResponseFacetValue[] {
  const values = [...facet.values];
  if (facet.type === 'regular') {
    let i = 0;
    while (values.length < targetCount && i < EXTRA_BRAND_VALUES.length) {
      if (!values.some((v) => v.value === EXTRA_BRAND_VALUES[i])) {
        values.push({
          state: 'idle',
          numberOfResults: Math.floor(Math.random() * 100) + 5,
          value: EXTRA_BRAND_VALUES[i],
        });
      }
      i++;
    }
  }
  return values;
}

/**
 * Request transformer for commerce search/listing endpoints.
 * Reads facet selections from the request body and reflects them in the response.
 */
export function commerceFacetTransformer<T extends CommerceResponse>(
  body: unknown,
  response: T
): T {
  const requestBody = body as RequestBody;
  if (!requestBody.facets || requestBody.facets.length === 0) {
    return response;
  }
  const cloned = structuredClone(response);
  cloned.facets = applyFacetSelections(cloned.facets, requestBody.facets);
  return cloned;
}

function buildCategoryFacetSearchResponse(
  query: string,
  numberOfValues: number
) {
  const allCategories = [
    ...EXTRA_CATEGORY_VALUES,
    {value: 'Sandals & Shoes', path: [] as string[], numberOfResults: 1992},
    {value: 'Accessories', path: [] as string[], numberOfResults: 534},
    {value: 'Clothing', path: [] as string[], numberOfResults: 464},
    {value: 'Bags', path: ['Accessories'], numberOfResults: 120},
    {value: 'Hats', path: ['Accessories'], numberOfResults: 80},
    {
      value: 'Running Shoes',
      path: ['Sandals & Shoes'],
      numberOfResults: 340,
    },
  ];

  const matching = allCategories.filter((c) =>
    c.value.toLowerCase().includes(query)
  );

  return {
    values: matching.slice(0, numberOfValues).map((c) => ({
      displayValue: c.value,
      rawValue: c.value,
      count: c.numberOfResults,
      path: c.path,
    })),
    moreValuesAvailable: matching.length > numberOfValues,
  };
}

export interface FacetSearchResponse {
  values: Array<{
    displayValue: string;
    rawValue: string;
    count: number;
    path?: string[];
  }>;
  moreValuesAvailable: boolean;
}

/**
 * Request transformer for the commerce facet search endpoint (/commerce/v2/facet).
 * Returns matching values based on the facetQuery parameter.
 */
export function createFacetSearchTransformer(
  baseResponse: CommerceResponse
): RequestTransformer<FacetSearchResponse> {
  return (body) => {
    const requestBody = body as FacetSearchRequestBody;
    const rawQuery = (requestBody.facetQuery || '').toLowerCase();
    const query = rawQuery.replace(/^\*|\*$/g, '');
    const facetId = requestBody.facetId;
    const numberOfValues = requestBody.numberOfValues || 10;

    const facet = baseResponse.facets.find((f) => f.facetId === facetId);

    if (!facet) {
      return {values: [], moreValuesAvailable: false};
    }

    if (facet.type === 'hierarchical') {
      return buildCategoryFacetSearchResponse(query, numberOfValues);
    }

    if (facet.type !== 'regular') {
      return {values: [], moreValuesAvailable: false};
    }

    const allValues = [
      ...facet.values.map((v) => v.value!),
      ...EXTRA_BRAND_VALUES,
    ];

    const matchingValues = allValues.filter(
      (v, i, arr) => v.toLowerCase().includes(query) && arr.indexOf(v) === i
    );

    return {
      values: matchingValues.slice(0, numberOfValues).map((v) => ({
        displayValue: v,
        rawValue: v,
        count: Math.floor(Math.random() * 200) + 5,
      })),
      moreValuesAvailable: matchingValues.length > numberOfValues,
    };
  };
}

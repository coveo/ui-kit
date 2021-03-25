import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from './interfaces/request';

export function selectPath(
  request: CategoryFacetRequest,
  path: string[],
  initialNumberOfValues: number
) {
  request.currentValues = buildCurrentValuesFromPath(
    path,
    initialNumberOfValues
  );
  request.numberOfValues = path.length ? 1 : initialNumberOfValues;
  request.preventAutoSelect = true;
}

function buildCurrentValuesFromPath(path: string[], retrieveCount: number) {
  if (!path.length) {
    return [];
  }

  const root = buildCategoryFacetValueRequest(path[0], retrieveCount);
  let curr = root;

  for (const segment of path.splice(1)) {
    const next = buildCategoryFacetValueRequest(segment, retrieveCount);
    curr.children.push(next);
    curr = next;
  }

  curr.state = 'selected';
  curr.retrieveChildren = true;

  return [root];
}

function buildCategoryFacetValueRequest(
  value: string,
  retrieveCount: number
): CategoryFacetValueRequest {
  return {
    value,
    retrieveCount,
    children: [],
    state: 'idle',
    retrieveChildren: false,
  };
}

import {
  CategoryFacetRequest,
  CategoryFacetValueRequest,
} from './interfaces/request';

export function selectPath(request: CategoryFacetRequest, path: string[]) {
  request.currentValues = buildCurrentValuesFromPath(path);
  request.numberOfValues = 1;
  request.preventAutoSelect = true;
}

function buildCurrentValuesFromPath(path: string[]) {
  if (!path.length) {
    return [];
  }

  const root = buildCategoryFacetValueRequest(path[0]);
  let curr = root;

  for (const segment of path.splice(1)) {
    const next = buildCategoryFacetValueRequest(segment);
    curr.children.push(next);
    curr = next;
  }

  curr.state = 'selected';
  curr.retrieveChildren = true;

  return [root];
}

function buildCategoryFacetValueRequest(
  value: string
): CategoryFacetValueRequest {
  return {
    value,
    retrieveCount: 5,
    children: [],
    state: 'idle',
    retrieveChildren: false,
  };
}

import type {Breadcrumb} from './breadcrumb-types';

const ELLIPSIS = '...';
const SEPARATOR = ' / ';

function limitPath(path: string[], pathLimit: number) {
  if (path.length <= pathLimit) {
    return path.join(SEPARATOR);
  }

  if (pathLimit === 1 && path.length > 1) {
    return [ELLIPSIS, path[path.length - 1]].join(SEPARATOR);
  }

  const ellipsedPath = [path[0], ELLIPSIS, ...path.slice(-(pathLimit - 1))];
  return ellipsedPath.join(SEPARATOR);
}

export function joinBreadcrumbValues(breadcrumb: Breadcrumb) {
  return Array.isArray(breadcrumb.formattedValue)
    ? breadcrumb.formattedValue.join(SEPARATOR)
    : breadcrumb.formattedValue;
}

export function getFirstBreadcrumbValue(
  breadcrumb: Breadcrumb,
  pathLimit: number
) {
  return Array.isArray(breadcrumb.formattedValue)
    ? limitPath(breadcrumb.formattedValue, pathLimit)
    : breadcrumb.formattedValue;
}

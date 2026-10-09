import type {BreadboxDeselectPayload, BreadboxFacet} from '@coveo/thermidor-schema/zod3';

export interface BreadboxValue {
  key: string;
  label: string;
  excluded: boolean;
  payload: BreadboxDeselectPayload;
}

const PRICE_FIELDS = new Set(['ec_price', 'ec_promo_price']);
const PATH_LIMIT = 3;
const PATH_SEPARATOR = ' / ';
const ELLIPSIS = '...';

function formatNumber(field: string, value: number): string {
  return PRICE_FIELDS.has(field) ? `$${value}` : value.toLocaleString();
}

/** Commerce API dates are `YYYY/MM/DD@HH:mm:ss`; the breadbox shows the day only. */
function formatDate(value: string): string {
  return value.split('@')[0].replaceAll('/', '-');
}

/** Keeps the root and the last values of a long path, as the Atomic breadbox does. */
export function limitPath(path: string[]): string {
  if (path.length <= PATH_LIMIT) {
    return path.join(PATH_SEPARATOR);
  }
  return [path[0], ELLIPSIS, ...path.slice(-(PATH_LIMIT - 1))].join(PATH_SEPARATOR);
}

export function breadboxValues(facet: BreadboxFacet): BreadboxValue[] {
  const {facetId} = facet;
  switch (facet.type) {
    case 'regular':
      return facet.values.map(({value, state}) => ({
        key: value,
        label: value,
        excluded: state === 'excluded',
        payload: {facetId, type: 'regular', value},
      }));
    case 'numericalRange':
      return facet.values.map(({start, end}) => ({
        key: `${start}..${end}`,
        label: `${formatNumber(facet.field, start)} – ${formatNumber(facet.field, end)}`,
        excluded: false,
        payload: {facetId, type: 'numericalRange', start, end},
      }));
    case 'dateRange':
      return facet.values.map(({start, end}) => ({
        key: `${start}..${end}`,
        label: `${formatDate(start)} – ${formatDate(end)}`,
        excluded: false,
        payload: {facetId, type: 'dateRange', start, end},
      }));
    case 'hierarchical':
      return facet.path.length > 0
        ? [
            {
              key: facet.path.join('/'),
              label: limitPath(facet.path),
              excluded: false,
              payload: {facetId, type: 'hierarchical', path: facet.path},
            },
          ]
        : [];
  }
}

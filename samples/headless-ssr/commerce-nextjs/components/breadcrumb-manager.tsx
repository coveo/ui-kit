'use client';

import type {
  CategoryFacetValue,
  DateFacetValue,
  LocationFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '@coveo/headless-react/ssr-commerce';
import {useBreadcrumbManager} from '@/lib/commerce-engine';

export default function BreadcrumbManager() {
  const {state, methods} = useBreadcrumbManager();

  const renderBreadcrumbValue = (
    value:
      | CategoryFacetValue
      | RegularFacetValue
      | NumericFacetValue
      | DateFacetValue
      | LocationFacetValue,
    type: string
  ) => {
    switch (type) {
      case 'hierarchical':
        return (value as CategoryFacetValue).path.join(' > ');
      case 'regular':
        return (value as RegularFacetValue).value;
      case 'numericalRange':
        return (
          (value as NumericFacetValue).start +
          ' - ' +
          (value as NumericFacetValue).end
        );
      case 'dateRange':
        return (
          (value as DateFacetValue).start +
          ' - ' +
          (value as DateFacetValue).end
        );
      default:
        // TODO COMHUB-291 support location breadcrumb
        return null;
    }
  };

  return (
    <div>
      <div>
        <button type="button" onClick={methods?.deselectAll}>
          Clear all filters
        </button>
      </div>
      <ul>
        {state.facetBreadcrumbs.map((facetBreadcrumb) => {
          return (
            <li key={`${facetBreadcrumb.facetId}-breadcrumbs`}>
              {facetBreadcrumb.values.map((value, index) => {
                return (
                  <button
                    type="button"
                    key={`${value.value}-breadcrumb-${index}`}
                    onClick={() => value.deselect()}
                  >
                    {facetBreadcrumb.facetDisplayName}:{' '}
                    {renderBreadcrumbValue(value.value, facetBreadcrumb.type)} X
                  </button>
                );
              })}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

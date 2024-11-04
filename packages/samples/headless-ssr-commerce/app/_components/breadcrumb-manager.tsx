import {
  BreadcrumbManagerState,
  NumericFacetValue,
  DateFacetValue,
  CategoryFacetValue,
  BreadcrumbManager as HeadlessBreadcrumbManager,
  RegularFacetValue,
  LocationFacetValue,
} from '@coveo/headless/ssr-commerce';
import {useEffect, useState} from 'react';

interface BreadcrumbManagerProps {
  staticState: BreadcrumbManagerState;
  controller?: HeadlessBreadcrumbManager;
}

export default function BreadcrumbManager(props: BreadcrumbManagerProps) {
  const {staticState, controller} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

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
        <button onClick={controller?.deselectAll}>Clear all filters</button>
      </div>
      <ul>
        {state.facetBreadcrumbs.map((facetBreadcrumb) => {
          return (
            <li key={`${facetBreadcrumb.facetId}-breadcrumbs`}>
              {facetBreadcrumb.values.map((value, index) => {
                return (
                  <button
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

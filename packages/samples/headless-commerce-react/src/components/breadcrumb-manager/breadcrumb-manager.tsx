import {
  CategoryFacetValue,
  RegularFacetValue,
  NumericFacetValue,
  DateFacetValue,
  BreadcrumbManager as HeadlessBreadcrumbManager,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface BreadcrumbManagerProps {
  controller: HeadlessBreadcrumbManager;
}

export default function BreadcrumbManager(props: BreadcrumbManagerProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState({...controller.state}));
  }, [controller]);

  if (!state.hasBreadcrumbs) {
    return null;
  }

  const renderBreadcrumbValue = (
    value:
      | CategoryFacetValue
      | RegularFacetValue
      | NumericFacetValue
      | DateFacetValue,
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
        return null;
    }
  };

  return (
    <div className="BreadcrumbManager">
      <div className="ClearAllBreadcrumbs">
        <button onClick={controller.deselectAll}>Clear all filters</button>
      </div>
      <ul className="Breadcrumbs">
        {state.facetBreadcrumbs.map((facetBreadcrumb) => {
          return (
            <li
              className="FacetBreadcrumbs"
              key={`${facetBreadcrumb.facetId}-breadcrumbs`}
            >
              {facetBreadcrumb.values.map((value, index) => {
                return (
                  <button
                    className="BreadcrumbValue"
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

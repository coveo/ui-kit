import {useBreadcrumbManager} from '@/lib/commerce-engine';
import {
  Breadcrumb,
  BreadcrumbValue,
  CategoryFacetValue,
  DateFacetValue,
  LocationFacetValue,
  NumericFacetValue,
  RegularFacetValue,
} from '@coveo/headless-react/ssr-commerce';

type AnyFacetValue =
  | RegularFacetValue
  | LocationFacetValue
  | NumericFacetValue
  | DateFacetValue
  | CategoryFacetValue;

export default function BreadcrumbManager() {
  const {state, methods} = useBreadcrumbManager();

  if (!state.hasBreadcrumbs) {
    return null;
  }

  const getFormattedValue = (value: AnyFacetValue) => {
    if ('path' in value) {
      return value.path.join(' > ');
    }

    if ('start' in value) {
      return `${value.start} - ${value.end}`;
    }

    return value.value;
  };

  const renderBreadcrumb = (breadcrumb: Breadcrumb<AnyFacetValue>) => {
    return (
      <li key={`${breadcrumb.facetId}`}>
        {breadcrumb.values.map((value) =>
          renderBreadcrumbValue(
            breadcrumb.facetId,
            breadcrumb.facetDisplayName,
            value
          )
        )}
      </li>
    );
  };

  const renderBreadcrumbValue = (
    breadcrumbFacetID: string,
    breadcrumbFacetDisplayName: string,
    breadcrumbValue: BreadcrumbValue<AnyFacetValue>
  ) => {
    const formattedValue = getFormattedValue(breadcrumbValue.value);

    return (
      <button
        key={`${breadcrumbFacetID}-${formattedValue}`}
        onClick={() => breadcrumbValue.deselect()}
        disabled={!methods}
      >
        <span>{breadcrumbFacetDisplayName}:</span>
        <span> {formattedValue}</span>
        <span> ×</span>
      </button>
    );
  };

  const renderClear = () => {
    return (
      <button disabled={!methods} onClick={methods?.deselectAll} type="reset">
        Clear
      </button>
    );
  };

  return (
    <div>
      <label htmlFor="breadcrumbs">
        <b>Filters:</b>
      </label>
      <ul id="breadcrumbs">
        {state.facetBreadcrumbs.map((facetBreadcrumb) =>
          renderBreadcrumb(facetBreadcrumb)
        )}
      </ul>
      {renderClear()}
    </div>
  );
}

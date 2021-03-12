import {useEffect, useState, FunctionComponent} from 'react';
import {
  BreadcrumbManager as HeadlessBreadcrumbManager,
  DateFacetValue,
  NumericFacetValue,
} from '@coveo/headless';
import {parseDate} from '../date-facet/date-utils';

interface BreadcrumbManagerProps {
  controller: HeadlessBreadcrumbManager;
  numericFormat: (n: number) => string;
}

export const BreadcrumbManager: FunctionComponent<BreadcrumbManagerProps> = (
  props
) => {
  const {controller} = props;
  const [state, setState] = useState(controller.state);

  useEffect(() => controller.subscribe(() => setState(controller.state)), []);

  function renderFacetBreadcrumbs() {
    return (
      <li>
        {state.facetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={breadcrumb.value.value}
                onClick={() => breadcrumb.deselect()}
              >
                {breadcrumb.value.value}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  function renderCategoryFacetBreadcrumbs() {
    return (
      <li>
        {state.categoryFacetBreadcrumbs.map((facet) => (
          <span key={facet.path.join('/')}>
            {facet.field}:{' '}
            <button onClick={() => facet.deselect()}>
              {facet.path.map(({value}) => value).join('/')}
            </button>
          </span>
        ))}
      </li>
    );
  }

  function getKeyForRange(value: NumericFacetValue | DateFacetValue) {
    return `[${value.start}..${value.end}${value.endInclusive ? ']' : '['}`;
  }

  function formatNumericRangeValue(value: number) {
    return props.numericFormat(value);
  }

  function renderNumericFacetBreadcrumbs() {
    return (
      <li>
        {state.numericFacetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={getKeyForRange(breadcrumb.value)}
                onClick={() => breadcrumb.deselect()}
              >
                {formatNumericRangeValue(breadcrumb.value.start)} to{' '}
                {formatNumericRangeValue(breadcrumb.value.end)}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  function formatDate(dateStr: string) {
    return parseDate(dateStr).format('MMMM D YYYY');
  }

  function renderDateFacetBreadcrumbs() {
    return (
      <li>
        {state.dateFacetBreadcrumbs.map((facet) => (
          <span key={facet.facetId}>
            {facet.field}:{' '}
            {facet.values.map((breadcrumb) => (
              <button
                key={getKeyForRange(breadcrumb.value)}
                onClick={() => breadcrumb.deselect()}
              >
                {formatDate(breadcrumb.value.start)} to{' '}
                {formatDate(breadcrumb.value.end)}
              </button>
            ))}
          </span>
        ))}
      </li>
    );
  }

  if (!state.hasBreadcrumbs) {
    return null;
  }

  return (
    <ul>
      {renderFacetBreadcrumbs()}
      {renderCategoryFacetBreadcrumbs()}
      {renderNumericFacetBreadcrumbs()}
      {renderDateFacetBreadcrumbs()}
    </ul>
  );
};

// usage

/**
 * ```tsx
 * const controller = buildBreadcrumbManager(engine);
 *
 * <BreadcrumbManager controller={controller} />;
 * ```
 */

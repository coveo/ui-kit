import type {CategoryFacet as CategoryFacetController} from '@coveo/headless';
import {useController} from '../use-controller';

interface CategoryFacetProps {
  controller: CategoryFacetController;
  title: string;
}

export function CategoryFacet({controller, title}: CategoryFacetProps) {
  const {
    valuesAsTrees,
    selectedValueAncestry,
    hasActiveValues,
    canShowMoreValues,
  } = useController(controller);

  // When a value is selected, drill into its children; otherwise show the root level.
  const activeValue = selectedValueAncestry.at(-1);
  const currentValues = hasActiveValues
    ? (activeValue?.children ?? [])
    : valuesAsTrees;

  if (!hasActiveValues && currentValues.length === 0) {
    return null;
  }

  return (
    <div className="facet">
      <h3 className="facet__title">{title}</h3>

      {hasActiveValues && (
        <ol className="facet__breadcrumb">
          <li>
            <button type="button" onClick={() => controller.deselectAll()}>
              All
            </button>
          </li>
          {selectedValueAncestry.map((value) => (
            <li key={value.path.join('/')}>
              <button
                type="button"
                onClick={() => controller.toggleSelect(value)}
              >
                {value.value}
              </button>
            </li>
          ))}
        </ol>
      )}

      <ul className="facet__values">
        {currentValues.map((value) => (
          <li key={value.path.join('/')}>
            <button
              type="button"
              className="facet__value facet__value--link"
              onClick={() => controller.toggleSelect(value)}
            >
              <span>{value.value}</span>
              <span className="facet__count">{value.numberOfResults}</span>
            </button>
          </li>
        ))}
      </ul>

      {canShowMoreValues && (
        <button
          type="button"
          className="facet__more"
          onClick={() => controller.showMoreValues()}
        >
          Show more
        </button>
      )}
    </div>
  );
}

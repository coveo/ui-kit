import type {Facet as FacetController} from '@coveo/headless';
import {useController} from '../use-controller';

interface FacetProps {
  controller: FacetController;
  title: string;
}

export function Facet({controller, title}: FacetProps) {
  const {values, hasActiveValues} = useController(controller);

  // A facet with no values for the current query is hidden entirely.
  if (values.length === 0) {
    return null;
  }

  return (
    <div className="facet">
      <h3 className="facet__title">{title}</h3>
      <ul className="facet__values">
        {values.map((value) => (
          <li key={value.value}>
            <label className="facet__value">
              <input
                type="checkbox"
                checked={controller.isValueSelected(value)}
                onChange={() => controller.toggleSelect(value)}
              />
              <span>{value.value}</span>
              <span className="facet__count">{value.numberOfResults}</span>
            </label>
          </li>
        ))}
      </ul>
      {hasActiveValues && (
        <button type="button" className="facet__clear" onClick={() => controller.deselectAll()}>
          Clear
        </button>
      )}
    </div>
  );
}

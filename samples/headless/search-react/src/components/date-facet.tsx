import type {DateFacet as DateFacetController} from '@coveo/headless';
import {useController} from '../use-controller';

interface DateFacetProps {
  controller: DateFacetController;
  title: string;
}

// Relative dates serialize as "period-amount-unit" (e.g. "past-1-week"), so we
// derive the label from the range's unit rather than its position in the list.
const UNIT_LABELS: Record<string, string> = {
  week: 'Past week',
  month: 'Past month',
  quarter: 'Past quarter',
  year: 'Past year',
};

function labelForRange(start: string): string {
  const unit = start.split('-')[2];
  return UNIT_LABELS[unit] ?? start;
}

export function DateFacet({controller, title}: DateFacetProps) {
  const {values} = useController(controller);

  const isVisible = (value: (typeof values)[number]) =>
    value.numberOfResults > 0 || value.state === 'selected';

  if (!values.some(isVisible)) {
    return null;
  }

  return (
    <div className="facet">
      <h3 className="facet__title">{title}</h3>
      <ul className="facet__values">
        {values.map((value) =>
          isVisible(value) ? (
            <li key={value.start}>
              <label className="facet__value">
                <input
                  type="checkbox"
                  checked={value.state === 'selected'}
                  onChange={() => controller.toggleSelect(value)}
                />
                <span>{labelForRange(value.start)}</span>
                <span className="facet__count">{value.numberOfResults}</span>
              </label>
            </li>
          ) : null
        )}
      </ul>
    </div>
  );
}

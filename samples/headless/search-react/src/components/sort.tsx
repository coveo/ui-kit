import type {Sort as SortController, SortCriterion} from '@coveo/headless';
import {useController} from '../use-controller';

export interface SortOption {
  label: string;
  criterion: SortCriterion;
}

interface SortProps {
  controller: SortController;
  options: SortOption[];
}

export function Sort({controller, options}: SortProps) {
  useController(controller);

  const selectedIndex = options.findIndex((option) =>
    controller.isSortedBy(option.criterion)
  );

  return (
    <label className="sort">
      Sort by{' '}
      <select
        value={selectedIndex === -1 ? 0 : selectedIndex}
        onChange={(e) =>
          controller.sortBy(options[Number(e.target.value)].criterion)
        }
      >
        {options.map((option, index) => (
          <option key={option.label} value={index}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

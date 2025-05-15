import {StaticFilterSection} from '../../state/state-sections.js';

/**
 * Given a static filter section, this function returns an array of selected filter expressions.
 * @param state The static filter section that contains the static filter set.
 * @returns An array of filter expressions.
 */
export function getStaticFilterExpressions(state: StaticFilterSection) {
  const filters = Object.values(state.staticFilterSet || {});
  return filters.map((filter) => {
    const selected = filter.values.filter(
      (value) => value.state === 'selected' && !!value.expression.trim()
    );

    const expression = selected.map((value) => value.expression).join(' OR ');
    return selected.length > 1 ? `(${expression})` : expression;
  });
}

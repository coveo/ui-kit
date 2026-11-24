import {useId} from 'react';
import {createComponentImplementation} from '@a2ui/react/v0_9';
import {type NumericFacetAction, NumericFacetPropsSchema} from '@coveo/thermidor-schema/zod3';
import {formatFieldNumber} from '../../context/format-configured-price.js';
import {useOptimisticNumericFacet} from './use-optimistic-numeric-facet.js';
import styles from './NumericFacet.module.css';

/**
 * A2-UI component for the `numeric-facet`. The generic binder resolves the facet state from
 * `NumericFacetPropsSchema`; its three gestures all carry an optimistic value, so they live in
 * `useOptimisticNumericFacet` and what is left here is the rendering.
 */
export const NumericFacet = createComponentImplementation(
  {
    name: 'NumericFacet',
    schema: NumericFacetPropsSchema,
  },
  // TODO(a2ui-react context): `context` is deprecated in @a2ui/react 0.16. Dispatch with
  // `useA2uiSurface()?.dispatchAction(action, componentId)` once a component can read its own id.
  ({props, context}) => {
    const labelId = useId();
    const startId = useId();
    const endId = useId();

    const dispatch = (action: NumericFacetAction) => context.dispatchAction(action);
    const optimisticFacet = useOptimisticNumericFacet(props, dispatch);

    const {displayName, domain} = props;
    const {hasActiveValues} = optimisticFacet;
    const domainMin = domain?.min;
    const domainMax = domain?.max;

    return (
      <section
        className={styles.container}
        data-testid={`facet-${props.field}`}
        aria-labelledby={labelId}
      >
        <div className={styles.header}>
          <h3 id={labelId} className={styles.title}>
            {displayName}
          </h3>
          {hasActiveValues && (
            <button className={styles.clearButton} type="button" onClick={optimisticFacet.clear}>
              Clear
            </button>
          )}
        </div>

        <ul className={styles.values}>
          {optimisticFacet.values.map((value) => {
            const isSelected = value.state === 'selected';
            return (
              <li key={`${value.start}-${value.end}`}>
                <button
                  className={`${styles.value} ${isSelected ? styles.selected : ''}`}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => optimisticFacet.toggleSingleSelect(value.start, value.end)}
                >
                  <span className={styles.valueLabel}>
                    {formatFieldNumber(props.field, value.start)} -{' '}
                    {formatFieldNumber(props.field, value.end)}
                  </span>
                  <span className={styles.count}>({value.numberOfResults})</span>
                </button>
              </li>
            );
          })}
        </ul>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            optimisticFacet.applyCustomRange();
          }}
        >
          <fieldset className={styles.customFieldset}>
            <label className={styles.customLabel} htmlFor={startId}>
              <span className={styles.labelText}>Min</span>
              <input
                id={startId}
                className={styles.customInput}
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="Min"
                min={domainMin}
                max={domainMax}
                value={optimisticFacet.customStart}
                onChange={(event) => optimisticFacet.setCustomStart(event.target.value)}
              />
            </label>
            <label className={styles.customLabel} htmlFor={endId}>
              <span className={styles.labelText}>Max</span>
              <input
                id={endId}
                className={styles.customInput}
                type="number"
                inputMode="decimal"
                step="any"
                placeholder="Max"
                min={domainMin}
                max={domainMax}
                value={optimisticFacet.customEnd}
                onChange={(event) => optimisticFacet.setCustomEnd(event.target.value)}
              />
            </label>
            <button className={styles.applyButton} type="submit">
              Apply
            </button>
          </fieldset>
        </form>
      </section>
    );
  }
);

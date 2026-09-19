import {useState} from 'react';
import {useRemoteController} from '../controllers.js';
import {useStateSource} from '../state-source-context.js';
import type {NumericFacetProps} from '@coveo/thermidor-schema';
import styles from './NumericFacet.module.css';

function formatRange(start: number, end: number): string {
  return `$${start} - $${end}`;
}

export function NumericFacetRenderer({props}: {props: NumericFacetProps}) {
  const stateSource = useStateSource();
  const controller = useRemoteController(stateSource, props.componentId, props.componentType);

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  if (!controller.state) {
    return null;
  }

  const {displayName, values, customRange, hasActiveValues, domain} = controller.state;

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  const handleToggleSingleSelect = (start: number, end: number) => {
    resetCustomInputs();
    controller.dispatch('toggleSingleSelect', {start, end});
  };

  const handleClear = () => {
    resetCustomInputs();
    controller.dispatch('clearAllActiveValues', {});
  };

  const domainMin = domain?.min;
  const domainMax = domain?.max;

  const clampToDomain = (value: number): number => {
    let clamped = value;
    if (domainMin !== undefined) {
      clamped = Math.max(clamped, domainMin);
    }
    if (domainMax !== undefined) {
      clamped = Math.min(clamped, domainMax);
    }
    return clamped;
  };

  const handleApplyCustomRange = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const parsedStart = Number(customStart);
    const parsedEnd = Number(customEnd);
    if (
      customStart === '' ||
      customEnd === '' ||
      !Number.isFinite(parsedStart) ||
      !Number.isFinite(parsedEnd)
    ) {
      return;
    }
    const start = clampToDomain(Math.min(parsedStart, parsedEnd));
    const end = clampToDomain(Math.max(parsedStart, parsedEnd));
    controller.dispatch('applyCustomRange', {start, end});
  };

  const groupLabelId = `numeric-facet-label-${props.componentId}`;

  return (
    <section
      className={styles.container}
      data-testid={props.componentId}
      aria-labelledby={groupLabelId}
    >
      <div className={styles.header}>
        <h3 id={groupLabelId} className={styles.title}>
          {displayName}
        </h3>
        {hasActiveValues && (
          <button className={styles.clearButton} type="button" onClick={handleClear}>
            Clear
          </button>
        )}
      </div>

      <ul className={styles.values}>
        {values.map((value) => {
          const isSelected = value.state === 'selected';
          return (
            <li key={`${value.start}-${value.end}`}>
              <button
                className={`${styles.value} ${isSelected ? styles.selected : ''}`}
                type="button"
                aria-pressed={isSelected}
                onClick={() => handleToggleSingleSelect(value.start, value.end)}
              >
                <span className={styles.valueLabel}>{formatRange(value.start, value.end)}</span>
                <span className={styles.count}>({value.numberOfResults})</span>
              </button>
            </li>
          );
        })}
        {customRange && (
          <li key="custom-range">
            <button
              className={`${styles.value} ${styles.selected}`}
              type="button"
              aria-pressed={true}
              data-testid={`facet-custom-range-${props.componentId}`}
              onClick={() => handleToggleSingleSelect(customRange.start, customRange.end)}
            >
              <span className={styles.valueLabel}>
                {formatRange(customRange.start, customRange.end)}
              </span>
              <span className={styles.count}>({customRange.numberOfResults})</span>
            </button>
          </li>
        )}
      </ul>

      <form className={styles.customForm} onSubmit={handleApplyCustomRange}>
        <label className={styles.customLabel} htmlFor={`numeric-facet-start-${props.componentId}`}>
          <span className={styles.labelText}>Min</span>
          <input
            id={`numeric-facet-start-${props.componentId}`}
            className={styles.customInput}
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="Min"
            min={domainMin}
            max={domainMax}
            value={customStart}
            onChange={(event) => setCustomStart(event.target.value)}
          />
        </label>
        <label className={styles.customLabel} htmlFor={`numeric-facet-end-${props.componentId}`}>
          <span className={styles.labelText}>Max</span>
          <input
            id={`numeric-facet-end-${props.componentId}`}
            className={styles.customInput}
            type="number"
            inputMode="decimal"
            step="any"
            placeholder="Max"
            min={domainMin}
            max={domainMax}
            value={customEnd}
            onChange={(event) => setCustomEnd(event.target.value)}
          />
        </label>
        <button className={styles.applyButton} type="submit">
          Apply
        </button>
      </form>
    </section>
  );
}

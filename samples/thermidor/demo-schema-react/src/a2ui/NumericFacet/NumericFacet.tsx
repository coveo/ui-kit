import {useId, useState} from 'react';
import type {NumericFacetProps, NumericFacetAction} from '@coveo/thermidor-schema';
import type {TypedRendererProps} from '../renderer-props.js';
import styles from './NumericFacet.module.css';

function formatRange(start: number, end: number): string {
  return `$${start} - $${end}`;
}

export function NumericFacetRenderer({
  props,
  dispatch,
}: TypedRendererProps<NumericFacetProps, NumericFacetAction>) {
  const labelId = useId();
  const startId = useId();
  const endId = useId();

  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const {displayName, customRange, hasActiveValues, domain} = props;
  const values = props.values ?? [];

  const resetCustomInputs = () => {
    setCustomStart('');
    setCustomEnd('');
  };

  const handleToggleSingleSelect = (start: number, end: number) => {
    resetCustomInputs();
    dispatch?.({event: {name: 'toggleSingleSelect', context: {start, end}}});
  };

  const handleClear = () => {
    resetCustomInputs();
    dispatch?.({event: {name: 'clearAllActiveValues', context: {}}});
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
    dispatch?.({event: {name: 'applyCustomRange', context: {start, end}}});
  };

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
              data-testid={`facet-custom-range-${props.field}`}
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
            value={customStart}
            onChange={(event) => setCustomStart(event.target.value)}
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

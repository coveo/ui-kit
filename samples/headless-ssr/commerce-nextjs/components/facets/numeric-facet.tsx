'use client';

import type {
  NumericFacet as HeadlessNumericFacet,
  NumericFacetState,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useRef, useState} from 'react';

interface INumericFacetProps {
  controller?: HeadlessNumericFacet;
  staticState: NumericFacetState;
}

export default function NumericFacet(props: INumericFacetProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);
  const [currentManualRange, setCurrentManualRange] = useState({
    start:
      controller?.state.manualRange?.start ??
      controller?.state.domain?.min ??
      controller?.state.values[0]?.start ??
      0,
    end:
      controller?.state.manualRange?.end ??
      controller?.state.domain?.max ??
      controller?.state.values[0]?.end ??
      0,
  });

  const manualRangeStartInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller?.subscribe(() => {
      setState(controller.state);
      setCurrentManualRange({
        start:
          controller.state.manualRange?.start ??
          controller.state.domain?.min ??
          controller.state.values[0]?.start ??
          0,
        end:
          controller.state.manualRange?.end ??
          controller.state.domain?.max ??
          controller.state.values[0]?.end ??
          0,
      });
    });
  }, [controller]);

  const focusManualRangeStartInput = (): void => {
    manualRangeStartInputRef.current!.focus();
  };

  const invalidRange =
    currentManualRange.start >= currentManualRange.end ||
    Number.isNaN(currentManualRange.start) ||
    Number.isNaN(currentManualRange.end);

  const onChangeManualRangeStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentManualRange({
      start: Number.parseInt(e.target.value, 10),
      end: currentManualRange.end,
    });
  };

  const onChangeManualRangeEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentManualRange({
      start: currentManualRange.start,
      end: Number.parseInt(e.target.value, 10),
    });
  };

  const onClickManualRangeSelect = () => {
    const start =
      state.domain && currentManualRange.start < state.domain.min
        ? state.domain.min
        : currentManualRange.start;
    const end =
      state.domain && currentManualRange.end > state.domain.max
        ? state.domain.max
        : currentManualRange.end;
    controller?.setRanges([
      {
        start,
        end,
        endInclusive: true,
        state: 'selected',
      },
    ]);
    focusManualRangeStartInput();
  };

  const onClickClearSelectedFacetValues = (): void => {
    controller?.deselectAll();
    focusManualRangeStartInput();
  };

  const renderManualRangeControls = () => {
    return (
      <div className="ManualRangeControls">
        <label
          className="ManualRangeStartLabel"
          htmlFor={`${state.facetId}-range-start`}
        >
          From:{' '}
        </label>
        <input
          aria-label="Manual range start"
          className="ManualRangeStartInput"
          disabled={!controller}
          id={`${state.facetId}-range-start`}
          onChange={onChangeManualRangeStart}
          ref={manualRangeStartInputRef}
          type="number"
          value={currentManualRange.start}
        />
        <label
          className="ManualRangeEndLabel"
          htmlFor={`${state.facetId}-range-end`}
        >
          To:{' '}
        </label>
        <input
          aria-label="Manual range end"
          className="ManualRangeEndInput"
          disabled={!controller}
          id={`${state.facetId}-range-end`}
          onChange={onChangeManualRangeEnd}
          type="number"
          value={currentManualRange.end}
        />
        <button
          aria-label="Apply manual range"
          className="ManualRangeSelect"
          disabled={!controller || invalidRange}
          onClick={onClickManualRangeSelect}
          type="submit"
        >
          Apply
        </button>
      </div>
    );
  };

  const renderFacetValues = () => {
    return (
      <div className="FacetValues">
        <ul>
          {state.values.map((value) => {
            const checkboxId = `${value.start}-${value.end}-${value.endInclusive}`;
            return (
              <li className="FacetValue" key={value.start}>
                <input
                  checked={value.state !== 'idle'}
                  className="FacetValueCheckbox"
                  disabled={!controller}
                  id={checkboxId}
                  onChange={() => controller?.toggleSelect(value)}
                  type="checkbox"
                ></input>
                <label className="FacetValueLabel" htmlFor={checkboxId}>
                  <span className="FacetValueName">
                    {Math.round(value.start * 100) / 100} to{' '}
                    {Math.round(value.end * 100) / 100}
                  </span>
                  <span className="FacetValueNumberOfProducts">
                    {' '}
                    ({value.numberOfResults})
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
        <button
          type="button"
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={!controller || state.isLoading || !state.canShowMoreValues}
          onClick={controller?.showMoreValues}
          title="Show more facet values"
        >
          Show more
        </button>
        <button
          type="button"
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={!controller || state.isLoading || !state.canShowLessValues}
          onClick={controller?.showLessValues}
          title="Show less facet values"
        >
          Show less
        </button>
      </div>
    );
  };

  return (
    <fieldset className="NumericFacet">
      <legend className="FacetHeader">
        <span className="FacetDisplayName">
          {state.displayName ?? state.facetId}
        </span>
        <button
          type="button"
          className="FacetClear"
          aria-label={`Clear ${state.displayName ?? state.facetId} filter`}
          disabled={!controller || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValues}
        >
          Clear
        </button>
      </legend>
      {renderManualRangeControls()}
      {renderFacetValues()}
    </fieldset>
  );
}

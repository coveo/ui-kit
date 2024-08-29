import {NumericFacet as HeadlessNumericFacet} from '@coveo/headless/commerce';
import {useEffect, useRef, useState} from 'react';

interface INumericFacetProps {
  controller: HeadlessNumericFacet;
}

export default function NumericFacet(props: INumericFacetProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);
  const [currentManualRange, setCurrentManualRange] = useState({
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

  const manualRangeStartInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    controller.subscribe(() => {
      setState(controller.state),
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
    isNaN(currentManualRange.start) ||
    isNaN(currentManualRange.end);

  const onChangeManualRangeStart = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentManualRange({
      start: Number.parseInt(e.target.value),
      end: currentManualRange.end,
    });
  };

  const onChangeManualRangeEnd = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentManualRange({
      start: currentManualRange.start,
      end: Number.parseInt(e.target.value),
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
    controller.setRanges([
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
    controller.deselectAll();
    focusManualRangeStartInput();
  };

  const renderManualRangeControls = () => {
    return (
      <div className="ManualRangeControls">
        <label className="ManualRangeStartLabel" htmlFor="manualRangeStart">
          From:{' '}
        </label>
        <input
          aria-label="Manual range start"
          className="ManualRangeStartInput"
          disabled={state.isLoading}
          id="manualRangeStart"
          ref={manualRangeStartInputRef}
          type="number"
          value={currentManualRange.start}
          onChange={onChangeManualRangeStart}
        />
        <label className="ManualRangeEndLabel" htmlFor="manualRangeEnd">
          To:{' '}
        </label>
        <input
          aria-label="Manual range end"
          className="ManualRangeEndInput"
          disabled={state.isLoading}
          id="manualRangeEnd"
          type="number"
          value={currentManualRange.end}
          onChange={onChangeManualRangeEnd}
        />
        <button
          aria-label="Select manual range"
          className="ManualRangeSelect"
          disabled={state.isLoading || invalidRange}
          onClick={onClickManualRangeSelect}
          type="submit"
        >
          ✓
        </button>
      </div>
    );
  };

  const renderFacetValues = () => {
    return (
      <div className="FacetValues">
        <button
          aria-label="Clear selected facet values"
          className="FacetClear"
          disabled={state.isLoading || !state.hasActiveValues}
          onClick={onClickClearSelectedFacetValues}
          type="reset"
        >
          X
        </button>
        {state.isLoading && <span> Facet is loading...</span>}
        <ul>
          {state.values.map((value, index) => {
            const checkboxId = `${value.start}-${value.end}-${value.endInclusive}`;
            return (
              <li className="FacetValue" key={index}>
                <input
                  className="FacetValueCheckbox"
                  disabled={state.isLoading}
                  id={checkboxId}
                  type="checkbox"
                  checked={value.state !== 'idle'}
                  onChange={() => controller.toggleSelect(value)}
                ></input>
                <label className="FacetValueLabel" htmlFor={checkboxId}>
                  <span className="FacetValueName">
                    {value.start} to {value.end}
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
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={state.isLoading || !state.canShowMoreValues}
          onClick={controller.showMoreValues}
        >
          +
        </button>
        <button
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={state.isLoading || !state.canShowLessValues}
          onClick={controller.showLessValues}
        >
          -
        </button>
      </div>
    );
  };

  return (
    <fieldset className="NumericFacet">
      <legend className="FacetDisplayName">
        {state.displayName ?? state.facetId}
      </legend>
      {renderManualRangeControls()}
      {renderFacetValues()}
    </fieldset>
  );
}

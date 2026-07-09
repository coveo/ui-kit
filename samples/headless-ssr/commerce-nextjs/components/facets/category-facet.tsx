'use client';

import type {
  CategoryFacetState,
  CategoryFacetValue,
  CategoryFacet as HeadlessCategoryFacet,
} from '@coveo/headless-react/ssr-commerce';
import {useEffect, useState} from 'react';

interface ICategoryFacetProps {
  controller?: HeadlessCategoryFacet;
  staticState: CategoryFacetState;
}

export default function CategoryFacet(props: ICategoryFacetProps) {
  const {controller, staticState} = props;

  const [state, setState] = useState(staticState);

  useEffect(() => {
    controller?.subscribe(() => setState(controller.state));
  }, [controller]);

  const toggleSelectFacetValue = (value: CategoryFacetValue): void => {
    if (controller?.isValueSelected(value)) {
      controller.deselectAll();
      return;
    }
    controller?.toggleSelect(value);
  };

  const renderFacetValue = (
    value: CategoryFacetValue,
    key: string,
    checked: boolean,
    isChild = false
  ) => {
    const checkboxId = `categoryFacetValue-${key}`;
    return (
      <li
        className={isChild ? 'FacetValue FacetValueChild' : 'FacetValue'}
        key={key}
      >
        <input
          checked={checked}
          className="FacetValueCheckbox"
          disabled={!controller}
          id={checkboxId}
          onChange={() => toggleSelectFacetValue(value)}
          type="checkbox"
        />
        <label className="FacetValueLabel" htmlFor={checkboxId}>
          <span className="FacetValueName">{value.value}</span>
          <span className="FacetValueCount">({value.numberOfResults})</span>
        </label>
      </li>
    );
  };

  const renderRootValues = () => (
    <ul className="FacetValues">
      {state.values.map((root) =>
        renderFacetValue(root, `${root.value}-root`, false)
      )}
    </ul>
  );

  const renderActiveValueTree = () => {
    const ancestry = state.selectedValueAncestry ?? [];
    const activeValueChildren = ancestry[ancestry.length - 1]?.children ?? [];

    return (
      <ul className="FacetValues">
        {ancestry.map((ancestryValue) =>
          renderFacetValue(
            ancestryValue,
            `${ancestryValue.value}-ancestry`,
            controller?.isValueSelected(ancestryValue) ?? false
          )
        )}
        {activeValueChildren.map((child) =>
          renderFacetValue(child, `${child.value}-child`, false, true)
        )}
      </ul>
    );
  };

  return (
    <fieldset className="CategoryFacet">
      <legend className="FacetHeader">
        <span className="FacetDisplayName">
          {state.displayName ?? state.facetId}
        </span>
        <button
          type="button"
          className="FacetClear"
          aria-label={`Clear ${state.displayName ?? state.facetId} filter`}
          disabled={!controller || !state.hasActiveValues}
          onClick={() => controller?.deselectAll()}
        >
          Clear
        </button>
      </legend>

      {state.hasActiveValues ? renderActiveValueTree() : renderRootValues()}

      <div className="FacetControls">
        <button
          type="button"
          aria-label="Show more facet values"
          className="FacetShowMore"
          disabled={!controller || state.isLoading || !state.canShowMoreValues}
          onClick={() => controller?.showMoreValues()}
        >
          Show more
        </button>
        <button
          type="button"
          aria-label="Show less facet values"
          className="FacetShowLess"
          disabled={!controller || state.isLoading || !state.canShowLessValues}
          onClick={() => controller?.showLessValues()}
        >
          Show less
        </button>
      </div>
    </fieldset>
  );
}

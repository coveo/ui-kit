import {
  CategoryFacetValue,
  CategoryFacet as HeadlessCategoryFacet,
} from '@coveo/headless/commerce';
import {useEffect, useState} from 'react';

interface ICategoryFacetProps {
  controller: HeadlessCategoryFacet;
}

export default function CategoryFacet(props: ICategoryFacetProps) {
  const {controller} = props;

  const [state, setState] = useState(controller.state);

  useEffect(() => {
    controller.subscribe(() => setState(controller.state));
  }, [controller]);

  const toggleSelect = (value: CategoryFacetValue) => {
    if (controller.isValueSelected(value)) {
      controller.deselectAll();
    }
    controller.toggleSelect(value);
  };

  const renderAncestry = () => {
    if (!state.hasActiveValues) {
      return null;
    }

    const ancestry = state.selectedValueAncestry!;
    const activeValueChildren = ancestry[ancestry.length - 1]?.children ?? [];

    return (
      <ul className="Ancestry">
        {ancestry.map((ancestor) => {
          return (
            <li className="AncestryValue" key={ancestor.value}>
              <input
                type="checkbox"
                checked={controller.isValueSelected(ancestor)}
                onChange={() => toggleSelect(ancestor)}
              ></input>
              <label>{ancestor.value}</label>
              <span> ({ancestor.numberOfResults})</span>
            </li>
          );
        })}
        {activeValueChildren.length > 0 && (
          <ul className="ActiveValueChildren">
            {activeValueChildren.map((leaf) => {
              return (
                <li className="ActiveValueChild" key={leaf.value}>
                  <input
                    type="checkbox"
                    checked={false}
                    onChange={() => toggleSelect(leaf)}
                  ></input>
                  <label>{leaf.value}</label>
                  <span> ({leaf.numberOfResults})</span>
                </li>
              );
            })}
          </ul>
        )}
      </ul>
    );
  };

  const renderRootValues = () => {
    if (state.hasActiveValues) {
      return null;
    }

    return (
      <ul className="RootFacetValues">
        {state.values.map((root) => {
          return (
            <li className="FacetValue" key={root.value}>
              <input
                className="FacetValueCheckbox"
                type="checkbox"
                checked={false}
                onChange={() => toggleSelect(root)}
              ></input>
              <label className="FacetValueName">{root.value}</label>
              <span className="FacetValueNumberOfResults">
                {' '}
                ({root.numberOfResults})
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <li className="CategoryFacet">
      <h3 className="FacetDisplayName">{state.displayName ?? state.facetId}</h3>
      <button
        className="FacetClear"
        disabled={!state.hasActiveValues}
        onClick={controller.deselectAll}
      >
        Clear
      </button>
      {renderRootValues()}
      {renderAncestry()}
      <button
        className="FacetShowMore"
        disabled={!state.canShowMoreValues}
        onClick={controller.showMoreValues}
      >
        Show more
      </button>
      <button
        className="FacetShowLess"
        disabled={!state.canShowLessValues}
        onClick={controller.showLessValues}
      >
        Show less
      </button>
    </li>
  );
}

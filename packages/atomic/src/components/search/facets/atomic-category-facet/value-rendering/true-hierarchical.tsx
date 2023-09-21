import {CategoryFacetValue} from '@coveo/headless';
import {FunctionalComponent, h} from '@stencil/core';
import {
  CategoryFacetValueRendererProps,
} from './commons';

export const HierarchicalFacet: FunctionalComponent<
  CategoryFacetValueRendererProps
> = ({
  facet,
  facetValues,
}: CategoryFacetValueRendererProps) => {
  function renderValue(currentValue: CategoryFacetValue) {
    return (
      <li>
        <select
        style={{padding:'0.25em'}}
          name={`${facet.state.facetId}-value-state-${currentValue.value}`}
          id={`${facet.state.facetId}-value-state-${currentValue.value}`}
          onChange={(e) => {
            // @ts-ignore
            switch(e.target!.value) {
                case 'selected':
                    facet.selectValue(currentValue);
                    break;
                case 'idle':
                    facet.clearValue(currentValue);
                    break;
                case 'excluded':
                    facet.excludeValue(currentValue);
                    break;
            }
          }}
        >
          <option value="selected" selected={currentValue.state === 'selected'}>
            Selected
          </option>
          <option value="idle" selected={currentValue.state === 'idle'}>
            Idle
          </option>
          <option value="excluded" selected={currentValue.state === 'excluded'}>
            Excluded
          </option>
        </select>
        <button style={{padding:'0.25em'}} value="+" onClick={()=>{
          facet.showMoreValues(currentValue)
        }}>+</button>
        <button style={{padding:'0.25em'}} value="-" onClick={()=>{
          facet.showLessValues(currentValue)
        }}>-</button>
        <span style={{padding:'0.25em'}}>{currentValue.value}</span>
        <ul style={{"padding-left": '2em'}}>{currentValue.children.map((child) => renderValue(child))}</ul>
      </li>
    );
  }

//   function renderValuesTree(currentValues: CategoryFacetValue[]): VNode[] {
//     return currentValues.map((parent) => {
//       const renderedChildren = renderValuesTree(parent.children);
//       return renderHierarchicalValue(parent, renderedChildren);
//     });
//   }

//   function renderHierarchicalValue(
//     facetValue: CategoryFacetValue,
//     children: VNode[]
//   ): VNode {
//     const displayValue = getFieldValueCaption(field, facetValue.value, i18n);
//     if (isValueSelected(facetValue)) {
//       return renderSelectedValue(facetValue, displayValue, children);
//     }
//     if (facetValue.children.length === 0) {
//       return renderLeafValue(facetValue, displayValue);
//     }
//     return renderNodeValue(facetValue, displayValue, children);
//   }

//   function renderSelectedValue(
//     facetValue: CategoryFacetValue,
//     displayValue: string,
//     children: VNode[]
//   ) {
//     return (
//       <FacetValueLink
//         displayValue={displayValue}
//         numberOfResults={facetValue.numberOfResults}
//         isSelected={true}
//         i18n={i18n}
//         onClick={() => {
//           focusTargets.activeValueFocus.focusAfterSearch();
//           facet.clearAll();
//         }}
//         searchQuery={facetSearchQuery}
//         part={`active-parent ${getIsLeafOrNodePart(facetValue)}`}
//         class="contents"
//         buttonRef={(el) => focusTargets.activeValueFocus.setTarget(el)}
//         subList={children.length > 0 && <ul part="values">{children}</ul>}
//       >
//         <FacetValueLabelHighlight
//           displayValue={displayValue}
//           isSelected={true}
//         ></FacetValueLabelHighlight>
//       </FacetValueLink>
//     );
//   }

//   function renderLeafValue(
//     facetValue: CategoryFacetValue,
//     displayValue: string
//   ) {
//     return (
//       <FacetValueLink
//         displayValue={displayValue}
//         numberOfResults={facetValue.numberOfResults}
//         isSelected={false}
//         i18n={i18n}
//         onClick={() => {
//           focusTargets.activeValueFocus.focusAfterSearch();
//           facet.selectValue(facetValue);
//         }}
//         searchQuery={facetSearchQuery}
//         part={`value-link ${getIsLeafOrNodePart(facetValue)}`}
//         class="contents"
//         buttonRef={(el) => focusTargets.activeValueFocus.setTarget(el)}
//       >
//         <FacetValueLabelHighlight
//           displayValue={displayValue}
//           isSelected={false}
//         ></FacetValueLabelHighlight>
//       </FacetValueLink>
//     );
//   }

//   function renderNodeValue(
//     facetValue: CategoryFacetValue,
//     displayValue: string,
//     children: VNode[]
//   ) {
//     const ariaLabel = i18n.t('facet-value', {
//       value: displayValue,
//       count: facetValue.numberOfResults,
//     });
//     return (
//       <li class="contents">
//         <Button
//           style="text-neutral"
//           part="parent-button"
//           ariaPressed="false"
//           onClick={getOnClickForUnselectedValue(
//             facet,
//             facetValue,
//             focusTargets.activeValueFocus
//           )}
//           ariaLabel={ariaLabel}
//         >
//           <atomic-icon
//             icon={LeftArrow}
//             part="back-arrow"
//             class="back-arrow"
//           ></atomic-icon>
//           <span class="truncate">{displayValue}</span>
//         </Button>
//         {children.length > 0 && <ul part="sub-parents">{children}</ul>}
//       </li>
//     );
//   }

  return <ul>{facetValues.map((child) => renderValue(child))}</ul>;
};

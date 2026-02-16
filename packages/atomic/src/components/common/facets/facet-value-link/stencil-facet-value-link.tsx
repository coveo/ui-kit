import {FunctionalComponent, h, VNode} from '@stencil/core';
import {Button} from '../../stencil-button';
import {FacetValueProps} from '../stencil-facet-common';

interface FacetValueLinkProps extends FacetValueProps {
  subList?: VNode | VNode[];
}

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValueLink: FunctionalComponent<FacetValueLinkProps> = (
  props,
  children
) => {
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
    formattedCount: count,
    interpolation: {escapeValue: false},
  });

  let part =
    props.part ?? `value-link${props.isSelected ? ' value-link-selected' : ''}`;

  if (props.additionalPart) {
    part += ` ${props.additionalPart}`;
  }

  return (
    <li key={props.displayValue} class={props.class}>
      <Button
        style="text-neutral"
        part={part}
        onClick={() => props.onClick()}
        class="group flex w-full items-center truncate px-2 py-2.5 text-left focus-visible:outline-none"
        ariaPressed={props.isSelected.toString()}
        ariaLabel={ariaLabel}
        ref={props.buttonRef}
      >
        {children}
        <span part="value-count" class="value-count">
          {props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </Button>
      {props.subList}
    </li>
  );
};

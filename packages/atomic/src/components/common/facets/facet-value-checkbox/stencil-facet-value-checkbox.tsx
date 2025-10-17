import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../../../utils/ripple-utils';
import {randomID} from '../../../../utils/utils';
import {StencilCheckbox} from '../../stencil-checkbox';
import {TriStateCheckbox} from '../../stencil-triStateCheckbox';
import {FacetValueExclude} from '../facet-value-exclude/stencil-facet-value-exclude';
import {FacetValueProps} from '../stencil-facet-common';

type TriStateFacetValueProps = Omit<FacetValueProps, 'isSelected'> & {
  state: 'idle' | 'selected' | 'excluded';
  onExclude(): void;
};

/**
 * @deprecated should only be used for Stencil components.
 */
export const FacetValueCheckbox: FunctionalComponent<
  FacetValueProps | TriStateFacetValueProps
> = (props, children) => {
  const id = randomID('facet-value-');
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabelAttributes = {
    value: props.displayValue,
    count: props.numberOfResults,
    formattedCount: count,
    interpolation: {escapeValue: false},
  };
  const selectedAriaLabel = props.i18n.t('facet-value', ariaLabelAttributes);
  const excludedAriaLabel = props.i18n.t(
    'facet-value-exclude',
    ariaLabelAttributes
  );
  let labelRef: HTMLLabelElement;

  const isTriStateCheckbox = (
    a: FacetValueProps | TriStateFacetValueProps
  ): a is TriStateFacetValueProps => {
    return 'state' in a && 'isSelected' in a;
  };

  const renderCheckbox = () => {
    const attributes = {
      id,
      onToggle: () => props.onClick(),
      part: 'value-checkbox',
      class: 'value-checkbox',
      ariaLabel: selectedAriaLabel,
      ref: props.buttonRef,
      onMouseDown: (e: MouseEvent) =>
        createRipple(e, {color: 'neutral', parent: labelRef}),
      iconPart: 'value-checkbox-icon',
    };

    if (isTriStateCheckbox(props)) {
      return <TriStateCheckbox {...attributes} state={props.state} />;
    }

    return <StencilCheckbox {...attributes} checked={props.isSelected} />;
  };

  const renderExclusion = () => {
    if (isTriStateCheckbox(props)) {
      return (
        <FacetValueExclude
          onClick={() => props.onExclude?.()}
          ariaLabel={excludedAriaLabel}
        ></FacetValueExclude>
      );
    }
  };

  return (
    <li key={props.displayValue} class="group relative flex items-center">
      {renderCheckbox()}
      <label
        ref={(ref) => (labelRef = ref!)}
        htmlFor={id}
        part="value-checkbox-label"
        class="items-center"
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
        aria-hidden="true"
      >
        {children}
        <span part="value-count" class="value-count">
          {props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </label>
      {renderExclusion()}
    </li>
  );
};

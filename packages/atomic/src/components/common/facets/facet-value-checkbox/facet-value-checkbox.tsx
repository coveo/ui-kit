import {FunctionalComponent, h} from '@stencil/core';
import {createRipple} from '../../../../utils/ripple';
import {randomID} from '../../../../utils/utils';
import {Checkbox} from '../../checkbox';
import {TriStateCheckbox} from '../../triStateCheckbox';
import {FacetValueProps, TriStateFacetValueProps} from '../facet-common';
import {FacetValueExclude} from '../facet-value-exclude/facet-value-exclude';

export const FacetValueCheckbox: FunctionalComponent<
  FacetValueProps | TriStateFacetValueProps
> = (props, children) => {
  const id = randomID('facet-value-');
  const count = props.numberOfResults.toLocaleString(props.i18n.language);
  const ariaLabel = props.i18n.t('facet-value', {
    value: props.displayValue,
    count: props.numberOfResults,
    interpolation: {escapeValue: false},
  });
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
      ariaLabel: ariaLabel,
      ref: props.buttonRef,
      onMouseDown: (e: MouseEvent) =>
        createRipple(e, {color: 'neutral', parent: labelRef}),
      iconPart: 'value-checkbox-icon',
    };

    if (isTriStateCheckbox(props)) {
      return <TriStateCheckbox {...attributes} state={props.state} />;
    }

    return <Checkbox {...attributes} checked={props.isSelected} />;
  };

  const renderExclusion = () => {
    if (isTriStateCheckbox(props)) {
      return (
        <FacetValueExclude
          onClick={() => props.onExclude?.()}
          part="value-exclude"
          class="value-exclude"
          // onMouseEnter={(e: MouseEvent) => createRipple(e, {color: 'primary'})}
          // TODO: create ripple effect
        ></FacetValueExclude>
      );
    }
  };

  return (
    <li key={props.displayValue} class="relative flex items-center">
      {renderCheckbox()}
      <label
        ref={(ref) => (labelRef = ref!)}
        htmlFor={id}
        part="value-checkbox-label"
        class="group items-center"
        onMouseDown={(e) => createRipple(e, {color: 'neutral'})}
        aria-hidden="true"
      >
        {renderExclusion()}
        {children}
        <span part="value-count" class="value-count">
          {props.i18n.t('between-parentheses', {
            text: count,
          })}
        </span>
      </label>
    </li>
  );
};

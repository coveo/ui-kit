import {FunctionalComponent} from '@/src/utils/functional-component-utils';
import {FacetValueState} from '@coveo/headless';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref} from 'lit/directives/ref.js';
import Tick from '../../images/checkbox.svg';
import Close from '../../images/close.svg';
import '../common/atomic-icon/atomic-icon';
import {CheckboxProps} from './checkbox';

export type TriStateCheckboxProps = Omit<CheckboxProps, 'checked'> & {
  state: FacetValueState;
};

export const renderTriStateCheckbox: FunctionalComponent<
  TriStateCheckboxProps
> = ({props}) => {
  const isSelected = props.state === 'selected';
  const isExcluded = props.state === 'excluded';
  const partName = props.part ?? 'checkbox';

  const baseClassNames =
    'w-4 h-4 grid place-items-center rounded focus-visible:outline-none hover:border-primary-light focus-visible:border-primary-light';
  const selectedClassNames =
    'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light';
  const excludedClassNames =
    'excluded bg-error hover:bg-error focus-visible:bg-error hover:border-error focus-visible:border-error';
  const unSelectedClassNames = 'border border-neutral-dark';

  const classNames = {
    [baseClassNames]: true,
    [selectedClassNames]: isSelected,
    [unSelectedClassNames]: !isSelected,
    [excludedClassNames]: isExcluded,
    [props.class ?? '']: Boolean(props.class),
  };

  const parts = [partName];
  if (isExcluded || isExcluded) {
    parts.push(`${partName}-checked`);
  }

  const iconClassNames = {
    'w-3/5': true,
    block: isSelected || isExcluded,
    hidden: !isSelected && !isExcluded,
  };

  // TODO: ensure ref is working
  return html`<button
    ${ref(props.ref)}
    .key=${props.key}
    id=${ifDefined(props.id)}
    class=${classMap(classNames)}
    part=${parts.join(' ')}
    aria-pressed=${isSelected ? 'true' : isExcluded ? 'mixed' : 'false'}
    aria-label=${ifDefined(props.ariaLabel ?? props.text)}
    value=${ifDefined(props.text)}
    role="button"
    @click=${() => props.onToggle?.(!isSelected)}
    @mousedown=${(e: MouseEvent) => props.onMouseDown?.(e)}
  >
    <atomic-icon
      style="stroke: 'white', fill: 'white'"
      class=${classMap(iconClassNames)}
      icon=${isSelected ? Tick : Close}
      part=${ifDefined(props.iconPart)}
    ></atomic-icon>
  </button>`;
};

import type {FacetValueState} from '@coveo/headless';
import {html} from 'lit';
import {classMap} from 'lit/directives/class-map.js';
import {ifDefined} from 'lit/directives/if-defined.js';
import {ref} from 'lit/directives/ref.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Tick from '../../images/checkbox.svg';
import Close from '../../images/close.svg';
import '../common/atomic-icon/atomic-icon';
import type {CheckboxProps} from './checkbox';

export type TriStateCheckboxProps = Omit<CheckboxProps, 'checked'> & {
  state: FacetValueState;
};

export const renderTriStateCheckbox: FunctionalComponent<
  TriStateCheckboxProps
> = ({props}) => {
  const isSelected = props.state === 'selected';
  const isExcluded = props.state === 'excluded';
  const partName = props.part ?? 'checkbox';

  const classNames = tw({
    'hover:border-primary-light focus-visible:border-primary-light grid h-4 w-4 place-items-center rounded focus-visible:outline-none': true,
    'selected bg-primary hover:bg-primary-light focus-visible:bg-primary-light':
      isSelected,
    'border-neutral-dark border': !isSelected,
    'excluded bg-error hover:bg-error focus-visible:bg-error hover:border-error focus-visible:border-error':
      isExcluded,
    [props.class ?? '']: Boolean(props.class),
  });

  const parts = [partName];
  if (isExcluded || isExcluded) {
    parts.push(`${partName}-checked`);
  }

  const iconClassNames = {
    'w-3/5': true,
    block: isSelected || isExcluded,
    hidden: !isSelected && !isExcluded,
  };

  return html`<button
    ${ref(props.ref)}
    .key=${props.key}
    id=${ifDefined(props.id)}
    class=${multiClassMap(classNames)}
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

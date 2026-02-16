import {html} from 'lit';
import {ifDefined} from 'lit/directives/if-defined.js';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface SwitchProps {
  checked: boolean;
  onToggle(checked: boolean): void;
  ariaLabel: string;
  part: string;
  tabIndex: number;
  title: string;
  withToggle: boolean;
}

export const renderSwitch: FunctionalComponent<SwitchProps> = ({props}) => {
  const containerClasses = tw({
    'w-12 h-6 p-1 rounded-full': true,
    'bg-primary': props.checked,
    'bg-neutral': !props.checked,
  });

  const handleClasses = tw({
    'w-4 h-4 rounded-full bg-white': true,
    'ml-6': props.checked,
  });

  const buttonClasses = tw({
    'rounded-full btn-outline-neutral': true,
    flex: props.withToggle,
    hidden: !props.withToggle,
  });

  return html`
    <button
      role="switch"
      class=${multiClassMap(buttonClasses)}
      aria-label=${ifDefined(props.ariaLabel)}
      aria-checked=${props.checked ? 'true' : 'false'}
      part=${ifDefined(props.part)}
      tabindex=${ifDefined(props.tabIndex)}
      title=${ifDefined(props.title)}
      @click=${() => props.onToggle(!props.checked)}
    >
      <div class=${multiClassMap(containerClasses)}>
        <div class=${multiClassMap(handleClasses)}></div>
      </div>
    </button>
  `;
};

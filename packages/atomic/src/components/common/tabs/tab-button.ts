import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';

export interface TabButtonProps {
  /**
   * The label to display on the tab button.
   */
  label: string;
  /**
   * Whether the tab button is active.
   */
  active?: boolean;
  /**
   * Click handler for the tab button.
   */
  select: () => void;
}

export const renderTabButton: FunctionalComponent<TabButtonProps> = ({
  props,
}) => {
  const containerClasses = tw({
    'relative after:block after:w-full after:h-1 after:absolute after:-bottom-0.5 after:bg-primary after:rounded':
      Boolean(props.active),
  });

  const buttonClassNames = [
    'w-full',
    'truncate',
    'px-2',
    'pb-1',
    'text-xl',
    'sm:px-6',
    'hover:text-primary',
    !props.active && 'text-neutral-dark',
  ]
    .filter(Boolean)
    .join(' ');

  return html`<div
      role="tab"
      class=${multiClassMap(containerClasses)}
      aria-selected=${props.active ? 'true' : 'false'}
      part=${props.active ? 'button-container-active' : 'button-container'}
    >
      ${renderButton({
        props: {
          style: 'text-transparent',
          class: buttonClassNames,
          part: props.active ? 'tab-button-active' : 'tab-button',
          onClick: props.select,
        },
      })(html`${props.label}`)}
    </div>`;
};

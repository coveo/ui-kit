import {html} from 'lit';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import Thumbs from '../../../images/thumbs.svg';
import {
  type ButtonStyle,
  getClassNameForButtonStyle,
  getRippleColorForButtonStyle,
} from '../button-style';
import '../atomic-icon/atomic-icon';
import {createRipple} from '@/src/utils/ripple-utils';

type FeedbackVariant = 'like' | 'dislike';

let feedbackButtonCounter = 0;

export interface FeedbackButtonProps {
  title: string;
  variant: FeedbackVariant;
  active: boolean;
  onClick: () => void;
}

export const renderFeedbackButton: FunctionalComponent<FeedbackButtonProps> = ({
  props,
}) => {
  const buttonStyle: ButtonStyle = 'text-transparent';
  const rippleColor = getRippleColorForButtonStyle(buttonStyle);
  const baseClassName = getClassNameForButtonStyle(buttonStyle);
  const tooltipId = `feedback-tooltip-${++feedbackButtonCounter}`;

  const classNames = multiClassMap(
    tw({
      [baseClassName]: true,
      'feedback-button rounded-md p-2': true,
      'text-neutral-dark': !props.active,
      [props.variant]: true,
      active: props.active,
      'hover:text-success': props.variant === 'like',
      'hover:text-error': props.variant === 'dislike',
      'text-success': props.active && props.variant === 'like',
      'text-error': props.active && props.variant === 'dislike',
    })
  );

  const iconClassNames = multiClassMap(
    tw({
      'w-5': true,
      'rotate-180': props.variant === 'dislike',
    })
  );

  return html`<span class="relative inline-block group">
    <button
      type="button"
      aria-label=${props.title}
      aria-describedby=${tooltipId}
      part="feedback-button"
      class=${classNames}
      aria-pressed=${props.active ? 'true' : 'false'}
      @mousedown=${(e: MouseEvent) => createRipple(e, {color: rippleColor})}
      @click=${props.onClick}
      @keydown=${(e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          (e.currentTarget as HTMLElement).blur();
        }
      }}
    >
      <atomic-icon class=${iconClassNames} .icon=${Thumbs}></atomic-icon>
    </button>
    <span
      id=${tooltipId}
      role="tooltip"
      part="tooltip"
      class="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 text-xs rounded bg-neutral-dark text-on-background-inverted whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity"
      >${props.title}</span
    >
  </span>`;
};

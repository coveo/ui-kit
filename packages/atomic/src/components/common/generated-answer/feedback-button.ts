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

  const classNames = multiClassMap(
    tw({
      [baseClassName]: true,
      'feedback-button rounded-md p-2 text-neutral-dark': true,
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

  return html`<button
    type="button"
    title=${props.title}
    part="feedback-button"
    class=${classNames}
    aria-pressed=${props.active ? 'true' : 'false'}
    @mousedown=${(e: MouseEvent) => createRipple(e, {color: rippleColor})}
    @click=${props.onClick}
  >
    <atomic-icon class=${iconClassNames} .icon=${Thumbs}></atomic-icon>
  </button>`;
};

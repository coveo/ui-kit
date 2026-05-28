import {html} from 'lit';
import {renderButton} from '@/src/components/common/button';
import {
  createTooltipId,
  dismissTooltipOnEscape,
  hideTooltip,
  showTooltip,
} from '@/src/components/common/tooltip-utils';
import type {FunctionalComponent} from '@/src/utils/functional-component-utils';
import CopyIcon from '../../../images/copy.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

export interface CopyButtonProps {
  title: string;
  isCopied: boolean;
  error: boolean;
  onClick: () => void;
}

export const renderCopyButton: FunctionalComponent<CopyButtonProps> = ({
  props,
}) => {
  const tooltipId = createTooltipId('atomic-generated-answer-copy');
  const classes = ['rounded-md', 'p-2'];
  if (props.isCopied) {
    classes.push('copied');
  }
  if (props.error) {
    classes.push('error');
  }

  return html`<div class="relative inline-flex">
    ${renderButton({
      props: {
        ariaLabel: props.title,
        part: 'copy-button',
        style: 'text-transparent',
        class: classes.join(' '),
        onClick: props.onClick,
        onFocus: (event) => showTooltip(event, tooltipId),
        onBlur: (event) => hideTooltip(event, tooltipId),
        onMouseEnter: (event) => showTooltip(event, tooltipId),
        onMouseLeave: (event) => hideTooltip(event, tooltipId),
        onKeyDown: (event) => dismissTooltipOnEscape(event, tooltipId),
      },
    })(html`
      <div class="icon-container text-neutral-dark">
        <atomic-icon class="w-5" .icon=${CopyIcon}></atomic-icon>
      </div>
    `)}
    <span
      id=${tooltipId}
      role="tooltip"
      class="pointer-events-none bg-neutral-dark text-on-primary absolute top-full left-1/2 z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs"
      hidden
    >
      ${props.title}
    </span>
  </div>`;
};

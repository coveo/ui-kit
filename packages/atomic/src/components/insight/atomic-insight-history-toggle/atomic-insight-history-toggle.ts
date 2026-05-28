import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {
  createTooltipId,
  dismissTooltipOnEscape,
  hideTooltip,
  showTooltip,
} from '@/src/components/common/tooltip-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import Clockicon from '../../../images/clock.svg';

/**
 * The `atomic-insight-history-toggle` component displays a button that toggles the visibility of the User Actions history panel.
 * This is useful for showing an agent the history of actions performed by the user who opened a support case within an insight interface.
 *
 * This is an internal component intended for use by Coveo developers only.
 *
 * @internal
 */
@customElement('atomic-insight-history-toggle')
@withTailwindStyles
export class AtomicInsightHistoryToggle extends LitElement {
  private readonly tooltipId = createTooltipId('atomic-insight-history-toggle');

  /**
   * The callback function to execute when the button is clicked.
   */
  @property({type: Object}) public clickCallback: () => void = () => {};

  /**
   * The tooltip text to display on the button.
   */
  @property({type: String}) public tooltip = '';

  protected render() {
    return html`<div class="relative inline-flex">
      ${renderIconButton({
        props: {
          partPrefix: 'insight-history-toggle',
          style: 'outline-neutral',
          icon: Clockicon,
          ariaLabel: 'history',
          onClick: this.clickCallback,
          onFocus: (event) => showTooltip(event, this.tooltipId),
          onBlur: (event) => hideTooltip(event, this.tooltipId),
          onMouseEnter: (event) => showTooltip(event, this.tooltipId),
          onMouseLeave: (event) => hideTooltip(event, this.tooltipId),
          onKeyDown: (event) => dismissTooltipOnEscape(event, this.tooltipId),
        },
      })}
      ${this.tooltip
        ? html`<span
            id=${this.tooltipId}
            role="tooltip"
            class="pointer-events-none bg-neutral-dark text-on-primary absolute top-full left-1/2 z-10 mt-1 -translate-x-1/2 whitespace-nowrap rounded px-2 py-1 text-xs"
            hidden
          >
            ${this.tooltip}
          </span>`
        : null}
    </div>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-history-toggle': AtomicInsightHistoryToggle;
  }
}

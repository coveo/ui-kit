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
import EditIcon from '../../../images/edit.svg';

/**
 * The `atomic-insight-edit-toggle` component provides an edit button for insight interfaces.
 *
 * @part insight-edit-toggle-container - The container element wrapping the edit toggle icon button.
 * @part insight-edit-toggle-button - The edit button element.
 * @part insight-edit-toggle-icon - The edit icon element displayed inside the button.
 */
@customElement('atomic-insight-edit-toggle')
@withTailwindStyles
export class AtomicInsightEditToggle extends LitElement {
  private readonly tooltipId = createTooltipId('atomic-insight-edit-toggle');

  /**
   * The callback function to be executed when the button is clicked.
   */
  @property({type: Function}) public clickCallback: () => void = () => {};

  /**
   * The tooltip text to display on hover.
   */
  @property({type: String}) public tooltip = '';

  protected render() {
    return html`<div class="relative inline-flex">
      ${renderIconButton({
        props: {
          partPrefix: 'insight-edit-toggle',
          style: 'outline-neutral',
          icon: EditIcon,
          ariaLabel: 'Edit',
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
    'atomic-insight-edit-toggle': AtomicInsightEditToggle;
  }
}

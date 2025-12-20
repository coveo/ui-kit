import {LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import Clockicon from '@/src/images/clock.svg';
import '@/src/components/common/atomic-icon/atomic-icon';

/**
 * The `atomic-insight-history-toggle` component displays a button to toggle the history panel.
 * @internal
 */
@customElement('atomic-insight-history-toggle')
export class AtomicInsightHistoryToggle extends LitElement {
  /**
   * The callback function to execute when the button is clicked.
   */
  @property({type: Object}) public clickCallback: () => void = () => {};

  /**
   * The tooltip text to display on the button.
   */
  @property({type: String}) public tooltip = '';

  protected render() {
    return renderIconButton({
      props: {
        partPrefix: 'insight-history-toggle',
        style: 'outline-neutral',
        icon: Clockicon,
        ariaLabel: 'history',
        onClick: this.clickCallback,
        title: this.tooltip,
      },
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-history-toggle': AtomicInsightHistoryToggle;
  }
}

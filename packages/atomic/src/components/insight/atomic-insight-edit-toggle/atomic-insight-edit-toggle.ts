import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderIconButton} from '@/src/components/common/icon-button';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import EditIcon from '../../../images/edit.svg';

/**
 * The `atomic-insight-edit-toggle` component provides an edit button for insight interfaces.
 *
 * @part insight-edit-toggle-button - The edit button element.
 */
@customElement('atomic-insight-edit-toggle')
@withTailwindStyles
export class AtomicInsightEditToggle extends LitElement {
  /**
   * The callback function to be executed when the button is clicked.
   */
  @property({type: Function}) public clickCallback: () => void = () => {};

  /**
   * The tooltip text to display on hover.
   */
  @property({type: String}) public tooltip = '';

  protected render() {
    return html`${renderIconButton({
      props: {
        partPrefix: 'insight-edit-toggle',
        style: 'outline-neutral',
        icon: EditIcon,
        ariaLabel: 'Edit',
        onClick: this.clickCallback,
        title: this.tooltip,
      },
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-insight-edit-toggle': AtomicInsightEditToggle;
  }
}

import {isParentOf} from 'c/quanticUtils';
import {LightningElement} from 'lwc';

/**
 * The `QuanticModalA11yHandler` component handles the accessibility of the Quantic interfaces. It makes the necessary changes to the accessibility tree each time a QuanticResultQuickview or a QuanticRefineModal is opened.
 * @category Search
 * @category Insight Panel
 * @example
 * <c-quantic-modal-a11y-handler></c-quantic-modal-a11y-handler>
 */
export default class QuanticModalA11yHandler extends LightningElement {
  /** @type {Array<HTMLElement>} */
  nonAccessibleElements = [];

  connectedCallback() {
    this.template.addEventListener(
      'quantic__resultpreviewtoggle',
      this.handleResultPreviewToggle
    );
    this.template.addEventListener(
      'quantic__refinemodaltoggle',
      this.handleRefineModalToggle
    );
    this.template.addEventListener(
      'quantic__useractionstoggle',
      this.handleUserActionsModalToggle
    );
  }

  disconnectedCallback() {
    this.template.removeEventListener(
      'quantic__resultpreviewtoggle',
      this.handleResultPreviewToggle
    );
    this.template.removeEventListener(
      'quantic__refinemodaltoggle',
      this.handleRefineModalToggle
    );
    this.template.removeEventListener(
      'quantic__useractionstoggle',
      this.handleUserActionsModalToggle
    );
  }

  handleResultPreviewToggle = (event) => {
    this.manageInterfaceA11y(event, 'C-QUANTIC-RESULT-LIST');
  };

  handleRefineModalToggle = (event) => {
    this.manageInterfaceA11y(event, 'C-QUANTIC-REFINE-TOGGLE');
  };

  handleUserActionsModalToggle = (event) => {
    this.manageInterfaceA11y(event, 'C-QUANTIC-USER-ACTIONS-TOGGLE');
  };

  /**
   * Makes the necessary changes to the accessibility tree of the Quantic interface.
   * @param {CustomEvent} event
   * @param {string} excludedTagName
   */
  manageInterfaceA11y(event, excludedTagName) {
    if (event.detail.isOpen) {
      /** @type {HTMLSlotElement} */
      const slot = this.template.querySelector('slot');
      let interfaceSlot = slot;
      if (interfaceSlot.assignedElements()[0].tagName === 'SLOT') {
        // @ts-ignore
        interfaceSlot = slot.assignedElements()[0];
      }
      /** @type {Array} */
      const children = Array.from(interfaceSlot.assignedElements());

      children.forEach((child) => {
        this.removeElementsFromA11yTree(child, excludedTagName);
      });
    } else {
      this.nonAccessibleElements.forEach((element) => {
        element.setAttribute('aria-hidden', 'false');
      });
      this.nonAccessibleElements = [];
    }
  }

  /**
   * Removes all HTML elements from the accessibility tree except for elements whose tag name is the excludedTagName, these elements remain accessible.
   * @param {HTMLElement} element
   * @param {string} excludedTagName
   */
  removeElementsFromA11yTree(element, excludedTagName) {
    /** @type {Array} */
    const childNodes = Array.from(element.childNodes);
    if (!isParentOf(element, excludedTagName)) {
      element.setAttribute('aria-hidden', 'true');
      this.nonAccessibleElements.push(element);
    } else if (childNodes.length > 0) {
      childNodes.forEach((child) =>
        this.removeElementsFromA11yTree(child, excludedTagName)
      );
    }
  }
}

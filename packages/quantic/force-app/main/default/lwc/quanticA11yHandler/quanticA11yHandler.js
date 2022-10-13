import {LightningElement} from 'lwc';
import {isCustomElement} from 'c/quanticUtils';

export default class QuanticA11yHandler extends LightningElement {
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
  }

  handleResultPreviewToggle = (event) => {
    this.manageInterfaceA11y(event, 'C-QUANTIC-RESULT-LIST');
  };

  handleRefineModalToggle = (event) => {
    this.manageInterfaceA11y(event, 'C-QUANTIC-REFINE-TOGGLE');
  };

  /**
   * Removes all HTML elements from the accessibility tree except for elements whose tag name is the excludedTagName, these elements remain accessible.
   * @param {string} excludedTagName
   */
  manageInterfaceA11y(event, excludedTagName) {
    if (event.detail.isOpen) {
      /** @type {HTMLSlotElement} */
      const slot = this.template.querySelector('slot');
      const interfaceSlot = slot.assignedElements()[0];
      // @ts-ignore
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
   * Checks whether an element is indeed the targetElement or one of its parents.
   * @param {HTMLElement} element
   * @param {string} targetElement
   */
  isParentOf(element, targetElement) {
    if (isCustomElement(element)) {
      if (element.tagName === targetElement) {
        return true;
      }
      return false;
    }
    /** @type {Array} */
    const childNodes = Array.from(element.childNodes);
    if (childNodes.length === 0) return false;
    return childNodes.reduce(
      (acc, val) => acc || this.isParentOf(val, targetElement),
      false
    );
  }

  /**
   * Removes all HTML elements from the accessibility tree except for elements whose tag name is the excludedTagName, these elements remain accessible.
   * @param {HTMLElement} element
   * @param {string} excludedTagName
   */
  removeElementsFromA11yTree(element, excludedTagName) {
    /** @type {Array} */
    const childNodes = Array.from(element.childNodes);
    if (!this.isParentOf(element, excludedTagName)) {
      element.setAttribute('aria-hidden', 'true');
      this.nonAccessibleElements.push(element);
    } else if (childNodes.length > 0) {
      childNodes.forEach((child) =>
        this.removeElementsFromA11yTree(child, excludedTagName)
      );
    }
  }
}

import {LightningElement} from 'lwc';

import more from '@salesforce/label/c.quantic_More';
import tabs from '@salesforce/label/c.quantic_Tabs';
import moreTabs from '@salesforce/label/c.quantic_MoreTabs';

/**
 *  The `QuanticTabBar` component displays the Quantic Tabs in a responsive manner by showing a drop-down list that will display overflowing tabs on smaller screens.
 * @category Search
 * @example
 * <c-quantic-tab-bar>
 *   <c-quantic-tab engine-id={engineId} label="Tab 1" expression={expressionOne} is-active></c-quantic-tab>
 *   <c-quantic-tab engine-id={engineId} label="Tab 2" expression={expressionTwo}></c-quantic-tab>
 *   <c-quantic-tab engine-id={engineId} label="Tab 3" expression={expressionThree}></c-quantic-tab>
 * </quantic-tab-bar>
 */
export default class QuanticTabBar extends LightningElement {
  labels = {
    more,
    tabs,
    moreTabs,
  };

  /** @type {boolean} */
  hasRendered = false;
  /** @type {boolean} */
  isComboboxOpen = false;
  /** @type {Array<{value: string, label: string}>} */
  options = [];
  /** @type {number} */
  maxMoreButtonWidth = 0;
  /** @type {boolean} */
  expandedMoreButton = true;

  connectedCallback() {
    window.addEventListener('resize', this.updateTabsDisplay);
    this.addEventListener('tab_rendered', this.updateTabsDisplay);
  }

  renderedCallback() {
    if (!this.hasRendered) {
      this.hideMoreButton();
      this.hasRendered = true;
    }
  }

  /**
   * Updates the display of the tabs.
   * @returns {void}
   */
  updateTabsDisplay = () => {
    if (this.isOverflow) {
      this.showMoreButton();
    } else {
      this.hideMoreButton();
    }
    this.updateTabVisibility(this.overflowingTabs, false);
    this.updateTabVisibility(this.displayedTabs, true);
    this.updateComboboxOptions();
    this.updateMoreButtonPosition();
    this.isComboboxOpen = false;
  };

  /**
   * Updates the combobox options.
   * @returns {void}
   */
  updateComboboxOptions() {
    this.options = this.overflowingTabs.map((el) => ({
      // @ts-ignore
      label: el.label,
      // @ts-ignore
      value: el.expression,
    }));
  }

  /**
   * Updates the position of the more button element.
   * @returns {void}
   */
  updateMoreButtonPosition() {
    this.moreButton?.style.setProperty(
      'left',
      `${this.displayedTabs.length ? this.lastVisibleTabRightPosition : 0}px`
    );
  }

  /**
   * Updates the state of the more button element.
   * @returns {void}
   */
  updateMoreButtonState() {
    if (this.hasRendered) {
      if (this.maxMoreButtonWidth < this.moreButtonWidth) {
        this.maxMoreButtonWidth = this.moreButtonWidth;
      }

      this.expandedMoreButton =
        this.containerWidth > this.maxMoreButtonWidth + this.selectedTabWidth;
    }
  }

  /**
   * Shows the more button.
   * @returns {void}
   */
  showMoreButton() {
    this.moreButton?.style.setProperty('display', 'block');
  }

  /**
   * Hides the more button.
   * @returns {void}
   */
  hideMoreButton() {
    this.moreButton?.style.setProperty('display', 'none');
  }

  /**
   * Updates the tabs visibility.
   * @param {Array<Element>} tabElements
   * @param {boolean} isVisible
   */
  updateTabVisibility(tabElements, isVisible) {
    tabElements.forEach((tab, index) => {
      const tabsCount = this.getTabsFromSlot().length;
      // @ts-ignore
      tab.style.setProperty(
        'order',
        isVisible ? index + 1 : tabsCount - tabElements.length + index + 1
      );
      // @ts-ignore
      tab.style.setProperty('visibility', isVisible ? 'visible' : 'hidden');
    });
  }

  /**
   * Indicates whether the tabs are causing an overflow.
   * @returns {boolean}
   */
  get isOverflow() {
    return this.slotContentWidth >= this.containerWidth;
  }

  /**
   * Returns the tab bar container element.
   * @returns {Element}
   */
  get container() {
    return this.template.querySelector('.tab-bar_container');
  }

  /**
   * Returns the container's width.
   * @returns {number}
   */
  get containerWidth() {
    return this.getAbsoluteWidth(this.container);
  }

  /**
   * returns the width of the content of the slot.
   * @returns {number}
   */
  get slotContentWidth() {
    return this.getTabsFromSlot()?.reduce(
      (total, el) => total + this.getAbsoluteWidth(el),
      0
    );
  }

  /**
   * returns the width of the more button.
   * @returns {number}
   */
  get moreButtonWidth() {
    return this.moreButton ? this.getAbsoluteWidth(this.moreButton) : 0;
  }

  /**
   * returns the width of the currently selected tab.
   * @returns {number}
   */
  get selectedTabWidth() {
    return this.getAbsoluteWidth(this.selectedTab);
  }

  /**
   * Returns the overflowing tabs.
   * @returns {Array<Element>}
   */
  get overflowingTabs() {
    const containerRight = this.container.getBoundingClientRect().right;
    const selectedTabRight = this.selectedTab.getBoundingClientRect().right;

    return this.getTabsFromSlot().filter((element) => {
      const currentTabBeforeSelectedTab =
        selectedTabRight > element.getBoundingClientRect().right;
      const rightPositionLimit = !this.isOverflow
        ? containerRight
        : currentTabBeforeSelectedTab
        ? containerRight - this.moreButtonWidth - this.selectedTabWidth
        : containerRight - this.moreButtonWidth;
      return (
        element.getBoundingClientRect().right > rightPositionLimit &&
        // @ts-ignore
        !element.isActive
      );
    });
  }

  /**
   * Returns the displayed tabs.
   * @returns {Array<Element>}
   */
  get displayedTabs() {
    return this.getTabsFromSlot().filter(
      (el) => !this.overflowingTabs.includes(el)
    );
  }

  /**
   * Returns the CSS classes of the dropdown.
   * @returns {string}
   */
  get dropdownClasses() {
    return `slds-dropdown-trigger slds-dropdown-trigger_click ${
      this.isComboboxOpen && 'slds-is-open'
    }`;
  }

  /**
   * Returns the name of the icon displayed inside the more button.
   * @returns {string}
   */
  get arrowIconName() {
    return this.isComboboxOpen ? 'utility:up' : 'utility:down';
  }

  /**
   * Returns the CSS classes of the icon displayed inside the more button.
   * @returns {string}
   */
  get moreButtonIconClasses() {
    return `slds-button__icon slds-button__icon_x-small slds-var-m-bottom_x-small ${
      this.expandedMoreButton ? 'slds-button__icon_right' : ''
    }`;
  }

  /**
   * Returns the more button element.
   * @returns {HTMLElement}
   */
  get moreButton() {
    return this.template.querySelector('.tab-bar_more-button');
  }

  /**
   * Returns the label displayed inside the more button.
   * @returns {string}
   */
  get moreButtonLabel() {
    this.updateMoreButtonState();
    return this.expandedMoreButton ? this.labels.more : '';
  }

  /**
   * Returns the last visible tab element.
   * @returns {Element}
   */
  get lastVisibleTab() {
    return this.displayedTabs[this.displayedTabs.length - 1];
  }

  /**
   * Returns the currently selected tab element.
   * @returns {Element}
   */
  get selectedTab() {
    // @ts-ignore
    return this.getTabsFromSlot().find((el) => el.isActive);
  }

  /**
   * Returns the tab bar list container element.
   * @returns {Element}
   */
  get tabBarListContainer() {
    return this.template.querySelector('.tab-bar_list-container');
  }

  /**
   * Returns the right position of the last visible tab.
   * @returns {number}
   */
  get lastVisibleTabRightPosition() {
    return (
      this.lastVisibleTab.getBoundingClientRect().right -
      this.tabBarListContainer.getBoundingClientRect().left
    );
  }

  /**
   * Handles slot change.
   * @returns {void}
   */
  handleSlotChange() {
    this.updateTabsDisplay();
  }

  /**
   * Toggles the combobox.
   * @returns {void}
   */
  toggleCombobox() {
    this.isComboboxOpen = !this.isComboboxOpen;
  }

  /**
   * Handles the selection of a tab from the dropdown list.
   * @returns {void}
   */
  handleDropdownTabSelect = (event) => {
    const targetValue = event.currentTarget.getAttribute('data-value');
    const clickedtab = this.overflowingTabs.find(
      // @ts-ignore
      (tab) => tab.expression === targetValue
    );
    // @ts-ignore
    clickedtab?.select();
    this.isComboboxOpen = false;
  };

  /**
   * Gets all the tab components found in the slot.
   * @returns {Array<Element>}
   */
  getTabsFromSlot() {
    const isTab = (tagName) => /-quantic-tab$/i.test(tagName);
    return Array.from(this.querySelectorAll('*')).filter((element) =>
      isTab(element.tagName)
    );
  }

  /**
   * Returns the padding values of an elemenet.
   * @param {Element} element
   * @returns {{top: number, right:number, bottom:number, left:number}}
   */
  getElementPadding(element) {
    const styles = window.getComputedStyle(element);

    return {
      top: parseFloat(styles.paddingTop),
      right: parseFloat(styles.paddingRight),
      bottom: parseFloat(styles.paddingBottom),
      left: parseFloat(styles.paddingLeft),
    };
  }

  /**
   * Returns the absolute width of an element.
   * @param {Element} element
   * @returns {number}
   */
  getAbsoluteWidth(element) {
    const paddings = this.getElementPadding(element);
    const padding = paddings.left + paddings.right;

    // @ts-ignore
    return Math.ceil(element.offsetWidth + padding);
  }
}

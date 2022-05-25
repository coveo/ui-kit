import {LightningElement} from 'lwc';

import more from '@salesforce/label/c.quantic_More';

/**
 *  The `QuanticTabBar` component displays the Quantic Tabs in a responsive manner. When tabs are wider than the available space, the tabs that cannot fit in the space are moved in the "More" drop-down list.
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
  };

  /** @type {boolean} */
  hasRendered = false;
  /** @type {boolean} */
  isComboboxOpen = false;
  /** @type {Array<{value: string, label: string}>} */
  tabsInDropdown = [];
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
      this.updateMoreButtonVisibility(false);
      this.hasRendered = true;
    }
  }

  /**
   * Updates the display of the tabs.
   * @returns {void}
   */
  updateTabsDisplay = () => {
    this.updateMoreButtonVisibility(this.isOverflow);
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
    this.tabsInDropdown = this.overflowingTabs.map((el) => ({
      // @ts-ignore
      label: el.label,
      // @ts-ignore
      value: el.expression,
    }));
  }

  /**
   * Updates the position of the "More" button element.
   * We need to update the position of the "More" button so that it is always to the right of the last tab displayed, as hidden tabs are just hidden visually but there is always space allocated for them.
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
   * Updates the visibility of the more button.
   * We update the More button position relativly to the last displayed tab.
   * @param {boolean} show
   */
  updateMoreButtonVisibility(show) {
    this.moreButton?.style.setProperty('display', show ? 'block' : 'none');
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
    return this.getTabsFromSlot().reduce(
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
   * We compare the right position of each tab to the right position of the tab container to find the tabs that overflow.
   * We include in our calculations the minimum width needed to display the elements that should always be displayed, namely the More button and the currently selected tab.
   * @returns {Array<Element>}
   */
  get overflowingTabs() {
    const containerRelativeRightPosition =
      this.container.getBoundingClientRect().right;
    const selectedTabRelativeRightPosition =
      this.selectedTab.getBoundingClientRect().right;

    return this.getTabsFromSlot().filter((element) => {
      const tabPositionedBeforeSelectedTab =
        selectedTabRelativeRightPosition >
        element.getBoundingClientRect().right;
      const minimumWidthNeeded = tabPositionedBeforeSelectedTab
        ? this.moreButtonWidth + this.selectedTabWidth
        : this.moreButtonWidth;
      const rightPositionLimit = !this.isOverflow
        ? containerRelativeRightPosition
        : containerRelativeRightPosition - minimumWidthNeeded;
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
   * Returns the CSS classes of the dropdown list.
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
   * Returns the padding values of an element.
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

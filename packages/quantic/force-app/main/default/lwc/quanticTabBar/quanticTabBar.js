import more from '@salesforce/label/c.quantic_More';
import {getAbsoluteWidth} from 'c/quanticUtils';
import {LightningElement, api} from 'lwc';

/**
 * The `QuanticTabBar` component presents a set of tabs in a responsive, adaptable layout.
 * When the width of the container is insufficient to display all tabs, the excess tabs are moved into a "More" dropdown menu,
 * ensuring accessibility across different screen sizes.
 * @category Search
 * @category Insight Panel
 * @slot - Accepts `QuanticTab` components or custom tab elements for display in the tab bar.
 *         Custom tab elements must include the attribute `data-role="tab"` to be recognized by `QuanticTabBar`.
 * @example
 * <c-quantic-tab-bar light-theme>
 *   <c-quantic-tab engine-id={engineId} label="Tab 1" expression={expressionOne} is-active></c-quantic-tab>
 *   <c-quantic-tab engine-id={engineId} label="Tab 2" expression={expressionTwo}></c-quantic-tab>
 *   <c-quantic-tab engine-id={engineId} label="Tab 3" expression={expressionThree}></c-quantic-tab>
 * </c-quantic-tab-bar>
 */
export default class QuanticTabBar extends LightningElement {
  labels = {
    more,
  };

  /**
   * Whether to apply the light theme styles on this component. This property has an impact only in a Salesforce console.
   * @api
   * @type {boolean}
   */
  @api lightTheme = false;

  /** @type {boolean} */
  hasRendered = false;
  /** @type {boolean} */
  isDropdownOpen = false;
  /** @type {Array<{value: string, label: string}>} */
  tabsInDropdown = [];
  /** @type {number} */
  maxMoreButtonWidth = 0;
  /** @type {boolean} */
  expandedMoreButton = true;

  connectedCallback() {
    window.addEventListener('click', this.closeDropdown);
    window.addEventListener('resize', this.updateTabsDisplay);
    this.addEventListener('quantic__tabrendered', this.updateTabsDisplay);
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
    this.updateDropdownOptions();
    this.updateMoreButtonPosition();
    this.isDropdownOpen = false;
  };

  /**
   * Updates the dropdown options.
   * @returns {void}
   */
  updateDropdownOptions() {
    this.tabsInDropdown = this.overflowingTabs.map((el, index) => ({
      id: index,
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
   * We update the More button position relatively to the last displayed tab.
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
    return this.slotContentWidth > this.containerWidth;
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
    return getAbsoluteWidth(this.container);
  }

  /**
   * returns the width of the content of the slot.
   * @returns {number}
   */
  get slotContentWidth() {
    return this.getTabsFromSlot().reduce(
      (total, el) => total + getAbsoluteWidth(el),
      0
    );
  }

  /**
   * returns the width of the more button.
   * @returns {number}
   */
  get moreButtonWidth() {
    return this.moreButton ? getAbsoluteWidth(this.moreButton) : 0;
  }

  /**
   * returns the width of the currently selected tab.
   * @returns {number}
   */
  get selectedTabWidth() {
    return getAbsoluteWidth(this.selectedTab);
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
      this.selectedTab?.getBoundingClientRect().right;

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
      this.isDropdownOpen && 'slds-is-open'
    }`;
  }

  /**
   * Returns the name of the icon displayed inside the more button.
   * @returns {string}
   */
  get arrowIconName() {
    return this.isDropdownOpen ? 'utility:up' : 'utility:down';
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
    return this.template.querySelector('.tab-bar_more-section');
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
   * Returns the CSS classes of the tab bar container.
   * @returns {string}
   */
  get tabBarContainerClasses() {
    return `tab-bar_container slds-size_1-of-1 ${
      this.lightTheme ? '' : 'slds-theme_shade'
    }`;
  }

  /**
   * Toggles the dropdown.
   * @returns {void}
   */
  toggleDropdown(event) {
    event.stopPropagation();
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  closeDropdown = () => {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  };

  get optionTabIndex() {
    return this.isDropdownOpen ? 0 : -1;
  }

  /**
   * Handles the selection of a tab from the dropdown list.
   * @returns {void}
   */
  handleDropdownTabSelect = (event) => {
    event.stopPropagation();
    const targetValue = event.currentTarget.getAttribute('data-value');
    const targetLabel = event.currentTarget.getAttribute('data-label');
    const clickedtab = this.overflowingTabs.find(
      // @ts-ignore
      (tab) => tab.expression === targetValue && tab.label === targetLabel
    );
    // @ts-ignore
    clickedtab?.select();
    this.isDropdownOpen = false;
  };

  /**
   * Gets all the tab components found in the slot.
   * @returns {Array<Element>}
   */
  getTabsFromSlot() {
    /** @type {HTMLSlotElement} */
    const slot = this.template.querySelector('slot');

    return slot.assignedElements().filter((element) => this.isTab(element));
  }

  isTab = (element) => {
    return (
      /-quantic-tab$/i.test(element.tagName) || element.dataset?.role === 'tab'
    );
  };

  /**
   * Returns the tab bar dropdown container element.
   * @returns {Element}
   */
  get tabBarDropdownContainer() {
    return this.template.querySelector('.tab-bar_dropdown');
  }

  /**
   * Triggered when the focus on dropdown item is out.
   * @param {FocusEvent} event
   */
  onBlur(event) {
    const isTargetElementOutsideDropdown = !(
      event.relatedTarget instanceof HTMLElement &&
      this.tabBarDropdownContainer.contains(event.relatedTarget)
    );
    if (this.isDropdownOpen && isTargetElementOutsideDropdown) {
      this.closeDropdown();
    }
  }
}

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

  /**
   * Signature of the state used during the last completed `updateTabsDisplay` pass.
   * Used to skip the entire pass when nothing layout-relevant has changed.
   * @type {string|null}
   */
  _lastTabStateSignature = null;

  connectedCallback() {
    window.addEventListener('click', this.closeDropdown);
    window.addEventListener('resize', this.updateTabsDisplay);
    this.addEventListener('quantic__tabrendered', this.updateTabsDisplay);
  }

  renderedCallback() {
    if (!this.hasRendered) {
      this.updateMoreButtonVisibility(false);
      this.hasRendered = true;
      this.updateMoreButtonState();
    }
  }

  /**
   * Updates the display of the tabs.
   * Skips the whole pass when nothing layout-relevant has changed since the last call, and otherwise
   * computes a single layout snapshot up front to avoid redundant `getBoundingClientRect` reads.
   * @returns {void}
   */
  updateTabsDisplay = () => {
    const tabElements = this.getTabsFromSlot();
    const tabStateSignature = this.deriveTabStateSignature(tabElements);

    if (
      this.hasRendered &&
      this._lastTabStateSignature !== null &&
      tabStateSignature === this._lastTabStateSignature
    ) {
      return;
    }
    this._lastTabStateSignature = tabStateSignature;

    const tabsCount = tabElements.length;
    const slotContentWidth = this.computeSlotContentWidth(tabElements);
    const isOverflow = slotContentWidth > this.containerWidth;
    // Must run before computeLayoutSnapshot: while display:none, moreButtonWidth reads as 0.
    this.updateMoreButtonVisibility(isOverflow);

    const snapshot = this.computeLayoutSnapshot(tabElements, isOverflow);

    this.updateTabVisibility(snapshot.overflowingTabs, false, tabsCount);
    this.updateTabVisibility(snapshot.displayedTabs, true, tabsCount);
    this.updateDropdownOptions(snapshot.overflowingTabs);
    this.updateMoreButtonPosition(snapshot.displayedTabs);
    this.updateMoreButtonState();
    this.isDropdownOpen = false;
  };

  /**
   * Derives a lightweight tab state signature representing the state relevant to the tab display
   * layout: the tab count, the container width, the identity of the currently active tab, and the
   * total rendered width of the tabs. The rendered width is included since it can change without
   * the other three changing (e.g. a placeholder label being replaced by the real one).
   * @param {Array<Element>} tabElements
   * @returns {string}
   */
  deriveTabStateSignature(tabElements) {
    // @ts-ignore
    const activeTabIndex = tabElements.findIndex((el) => el.isActive);
    const slotContentWidth = this.computeSlotContentWidth(tabElements);
    return `${tabElements.length}|${this.containerWidth}|${activeTabIndex}|${slotContentWidth}`;
  }

  /**
   * Computes, in a single pass, all the layout values needed to update the tabs display.
   * Must be called after the "More" button's visibility has been set for this pass, so its
   * width reflects its real rendered size rather than 0 from being `display: none`.
   * @param {Array<Element>} tabElements
   * @param {boolean} isOverflow Whether the tabs overflow the container.
   * @returns {{overflowingTabs: Array<Element>, displayedTabs: Array<Element>}}
   */
  computeLayoutSnapshot(tabElements, isOverflow) {
    // @ts-ignore
    const selectedTab = tabElements.find((el) => el.isActive);
    const selectedTabWidth = selectedTab ? getAbsoluteWidth(selectedTab) : 0;
    const moreButtonWidth = this.moreButton
      ? getAbsoluteWidth(this.moreButton)
      : 0;

    const containerRightPosition = this.container.getBoundingClientRect().right;
    const selectedTabRightPosition = selectedTab?.getBoundingClientRect().right;

    const overflowingTabs = tabElements.filter((element) =>
      this.isTabOverflowing(element, {
        isOverflow,
        containerRightPosition,
        selectedTabRightPosition,
        moreButtonWidth,
        selectedTabWidth,
      })
    );

    // Set avoids O(n²) lookups from Array.includes when filtering displayedTabs.
    const overflowingTabsSet = new Set(overflowingTabs);
    const displayedTabs = tabElements.filter(
      (el) => !overflowingTabsSet.has(el)
    );

    return {
      overflowingTabs,
      displayedTabs,
    };
  }

  /**
   * Indicates whether a given tab overflows the container.
   * A tab overflows once its right edge crosses the available space, where the available space
   * is reduced to reserve room for the "More" button (always) and, for tabs positioned before the
   * currently selected tab, also the selected tab itself (since the selected tab must always stay
   * visible regardless of where it falls in the tab order).
   * @param {Element} tabElement
   * @param {{isOverflow: boolean, containerRightPosition: number, selectedTabRightPosition: number, moreButtonWidth: number, selectedTabWidth: number}} context
   * @returns {boolean}
   */
  isTabOverflowing(tabElement, context) {
    const {
      isOverflow,
      containerRightPosition,
      selectedTabRightPosition,
      moreButtonWidth,
      selectedTabWidth,
    } = context;

    // @ts-ignore
    if (tabElement.isActive) {
      return false;
    }

    const tabRightPosition = tabElement.getBoundingClientRect().right;
    const isBeforeSelectedTab = selectedTabRightPosition > tabRightPosition;
    const reservedWidth = isBeforeSelectedTab
      ? moreButtonWidth + selectedTabWidth
      : moreButtonWidth;
    const availableRightPosition = isOverflow
      ? containerRightPosition - reservedWidth
      : containerRightPosition;

    return tabRightPosition > availableRightPosition;
  }

  /**
   * Updates the dropdown options.
   * @param {Array<Element>} [overflowingTabs] Optionally pass a pre-computed list of overflowing tabs
   *  to avoid recomputing it from the live DOM.
   * @returns {void}
   */
  updateDropdownOptions(overflowingTabs = this.overflowingTabs) {
    this.tabsInDropdown = overflowingTabs.map((el, index) => ({
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
   * @param {Array<Element>} [displayedTabs] Optionally pass a pre-computed list of displayed tabs
   *  to avoid recomputing it from the live DOM.
   * @returns {void}
   */
  updateMoreButtonPosition(displayedTabs = this.displayedTabs) {
    const lastVisibleTab = displayedTabs[displayedTabs.length - 1];
    const position = lastVisibleTab
      ? lastVisibleTab.getBoundingClientRect().right -
        this.tabBarListContainer.getBoundingClientRect().left
      : 0;
    this.moreButton?.style.setProperty('left', `${position}px`);
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
   * @param {number} [totalTabsCount] Optionally pass the total tab count to avoid recomputing it from the live DOM.
   */
  updateTabVisibility(
    tabElements,
    isVisible,
    totalTabsCount = this.getTabsFromSlot().length
  ) {
    tabElements.forEach((tab, index) => {
      // @ts-ignore
      tab.style.setProperty(
        'order',
        isVisible ? index + 1 : totalTabsCount - tabElements.length + index + 1
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
    return this.computeSlotContentWidth(this.getTabsFromSlot());
  }

  /**
   * Computes the total rendered width of the given tab elements.
   * Shared by `slotContentWidth`, `deriveTabStateSignature`, and `computeLayoutSnapshot` so the
   * calculation only lives in one place, while still letting each caller pass in a `tabElements`
   * array it already has on hand instead of re-querying the slot.
   * @param {Array<Element>} tabElements
   * @returns {number}
   */
  computeSlotContentWidth(tabElements) {
    return tabElements.reduce((total, el) => total + getAbsoluteWidth(el), 0);
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
    // Set avoids O(n²) lookups from Array#includes.
    const overflowingTabsSet = new Set(this.overflowingTabs);
    return this.getTabsFromSlot().filter((el) => !overflowingTabsSet.has(el));
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

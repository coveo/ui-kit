import more from '@salesforce/label/c.quantic_More';
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
  /** @type {Array<Element>} */
  _overflowingTabs = [];
  /** @type {Array<Element>} */
  _displayedTabs = [];
  /** @type {boolean} */
  _updateDisplayDirty = false;
  /** @type {boolean} */
  _updateScheduled = false;

  /**
   * Rects captured for the current layout pass.
   * @type {{container: DOMRect, moreButton: DOMRect, tabs: Map<Element, DOMRect>}|null}
   */
  _layoutRects = null;

  connectedCallback() {
    window.addEventListener('click', this.closeDropdown);
    window.addEventListener('resize', this.updateTabsDisplay);
    this.addEventListener('quantic__tabrendered', this.handleTabRendered);
  }

  renderedCallback() {
    if (!this.hasRendered) {
      this.updateMoreButtonVisibility(false);
      this.hasRendered = true;
    }
  }

  handleTabRendered = () => {
    this._updateDisplayDirty = true;

    if (this._updateScheduled) {
      return;
    }
    this._updateScheduled = true;
    // eslint-disable-next-line @lwc/lwc/no-async-operation
    requestAnimationFrame(() => {
      this._updateScheduled = false;
      if (this._updateDisplayDirty) {
        this._updateDisplayDirty = false;
        this.updateTabsDisplay();
      }
    });
  };

  /**
   * Updates the display of the tabs.
   * Computes a single layout snapshot up front to avoid redundant `getBoundingClientRect` reads.
   * @returns {void}
   */
  updateTabsDisplay = () => {
    const tabElements = this.getTabsFromSlot();
    this._layoutRects = {
      container: this.container.getBoundingClientRect(),
      moreButton: this.moreButton?.getBoundingClientRect(),
      tabs: new Map(
        tabElements.map((tab) => [tab, tab.getBoundingClientRect()])
      ),
    };

    const containerWidth = this._layoutRects.container.width;
    const slotContentWidth = this.computeSlotContentWidth(tabElements);
    const tabsCount = tabElements.length;
    const isOverflow = slotContentWidth > containerWidth;
    // Must run before categorizeTabsVisibility: while display:none, moreButtonWidth reads as 0.
    this.updateMoreButtonVisibility(isOverflow);
    this._layoutRects.moreButton = this.moreButton?.getBoundingClientRect();
    this.updateMoreButtonState();

    const {overflowingTabs, displayedTabs} = this.categorizeTabsVisibility(
      tabElements,
      isOverflow
    );
    this._overflowingTabs = overflowingTabs;
    this._displayedTabs = displayedTabs;

    this.updateTabVisibility(overflowingTabs, false, tabsCount);
    this.updateTabVisibility(displayedTabs, true, tabsCount);
    this.updateDropdownOptions(overflowingTabs);
    this.updateMoreButtonPosition(displayedTabs);
    this.isDropdownOpen = false;
    this._layoutRects = null;
  };

  /**
   * Computes, in a single pass, all the layout values needed to update the tabs display.
   * @param {Array<Element>} tabElements
   * @param {boolean} isOverflow Whether the tabs overflow the container.
   * @returns {{overflowingTabs: Array<Element>, displayedTabs: Array<Element>}}
   */
  categorizeTabsVisibility(tabElements, isOverflow) {
    // @ts-ignore
    const selectedTab = tabElements.find((el) => el.isActive);
    const selectedTabWidth = Math.ceil(
      this._layoutRects.tabs.get(selectedTab)?.width ?? 0
    );
    const moreButton = this.moreButton?.querySelector('button');
    const moreButtonWidth = Math.max(
      this._layoutRects.moreButton?.width ?? 0,
      moreButton?.offsetWidth ?? 0,
      moreButton?.scrollWidth ?? 0
    );
    const containerWidth = this._layoutRects.container.width;
    const displayedTabs = [];
    const overflowingTabs = [];
    let displayedTabsWidth = 0;
    let selectedTabDisplayed = false;

    tabElements.forEach((tab) => {
      const tabWidth = Math.ceil(this._layoutRects.tabs.get(tab)?.width ?? 0);
      // @ts-ignore
      if (tab.isActive) {
        displayedTabs.push(tab);
        displayedTabsWidth += tabWidth;
        selectedTabDisplayed = true;
        return;
      }

      const reservedWidth = isOverflow
        ? moreButtonWidth + (selectedTabDisplayed ? 0 : selectedTabWidth)
        : 0;
      if (displayedTabsWidth + tabWidth + reservedWidth <= containerWidth) {
        displayedTabs.push(tab);
        displayedTabsWidth += tabWidth;
      } else {
        overflowingTabs.push(tab);
      }
    });

    return {overflowingTabs, displayedTabs};
  }

  /**
   * Updates the dropdown options.
   * @param {Array<Element>} [overflowingTabs]
   * @returns {void}
   */
  updateDropdownOptions(overflowingTabs) {
    // @ts-ignore
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
   * The displayed tabs are assigned contiguous flex orders below, so their widths determine the
   * position of More even before the browser applies the new order.
   * @param {Array<Element>} [displayedTabs] Optionally pass a pre-computed list of displayed tabs
   *  to avoid recomputing it from the live DOM.
   * @returns {void}
   */
  updateMoreButtonPosition(displayedTabs) {
    const position = displayedTabs.reduce(
      (total, tab) =>
        total + Math.ceil(this._layoutRects.tabs.get(tab)?.width ?? 0),
      0
    );
    this.moreButton?.style.setProperty('left', `${position}px`);
  }

  /**
   * Updates the state of the more button element.
   * @returns {void}
   */
  updateMoreButtonState() {
    if (this.hasRendered) {
      const moreButtonWidth = this._layoutRects.moreButton?.width ?? 0;
      const selectedTabWidth = Math.ceil(
        this._layoutRects.tabs.get(this.selectedTab)?.width ?? 0
      );

      if (this.maxMoreButtonWidth < moreButtonWidth) {
        this.maxMoreButtonWidth = moreButtonWidth;
      }

      this.expandedMoreButton =
        this._layoutRects.container.width >
        this.maxMoreButtonWidth + selectedTabWidth;
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
   * Returns the tab bar container element.
   * @returns {Element}
   */
  get container() {
    return this.template.querySelector('.tab-bar_container');
  }

  /**
   * Computes the total rendered width of the given tab elements.
   * @param {Array<Element>} tabElements
   * @returns {number}
   */
  computeSlotContentWidth(tabElements) {
    return tabElements.reduce(
      (total, el) =>
        total + Math.ceil(this._layoutRects.tabs.get(el)?.width ?? 0),
      0
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
    return this.expandedMoreButton ? this.labels.more : '';
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
    const clickedtab = this._overflowingTabs.find(
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

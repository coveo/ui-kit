import {LightningElement} from 'lwc';

import more from '@salesforce/label/c.quantic_More';
import tabs from '@salesforce/label/c.quantic_Tabs';
import moreTabs from '@salesforce/label/c.quantic_MoreTabs';

export default class QuanticTabBar extends LightningElement {
  labels = {
    more,
    tabs,
    moreTabs,
  };

  hasRendered = false;
  isComboboxOpen = false;
  options = [];

  /** Lifecycle */

  connectedCallback() {
    window.addEventListener('resize', this.updateTabVisibility);
    this.addEventListener('tab_selected', (evt) => {
      evt?.stopPropagation();
      this.handleTabSelected();
    });
    this.addEventListener('tab_rendered', (evt) => {
      evt?.stopPropagation();
      this.updateTabVisibility();
    });
  }

  renderedCallback() {
    if (!this.hasRendered) {
      this.hideMoreButton();
      this.hasRendered = true;
    }
  }

  /** Helpers */

  updateTabVisibility = () => {
    if (this.isOverflow) {
      this.showMoreButton();
      this.setTabVisibility(this.overflowingTabs, false);
      this.updateComboboxOptions();
      this.updateMoreButtonPosition();
    } else {
      this.hideMoreButton();
      this.isComboboxOpen = false;
      this.options = [];
      this.setTabVisibility(this.getTabsFromSlot(), true);
    }
    this.setTabVisibility(this.displayedTabs, true);
  };

  updateComboboxOptions() {
    this.options = this.overflowingTabs.map((el) => ({
      label: el.label,
      value: el.expression,
      selected:
        el.isActive ||
        this.options.find((option) => option.value === el.expression)
          ?.selected ||
        false,
    }));
  }

  updateMoreButtonPosition() {
    this.moreButton?.style.setProperty(
      'left',
      `${this.displayedTabs.length ? this.lastVisibleTabRightPosition : 0}px`
    );
  }

  showMoreButton() {
    this.moreButton?.style.setProperty('display', 'block');
  }

  hideMoreButton() {
    this.moreButton?.style.setProperty('display', 'none');
  }

  setTabVisibility(tabElements, isVisible) {
    tabElements.forEach((tab) =>
      tab.style.setProperty('visibility', isVisible ? 'visible' : 'hidden')
    );
  }

  /** Getters */

  get isOverflow() {
    return this.slottedWidth >= this.containerWidth;
  }

  get container() {
    return this.template.querySelector('.tab-bar_container');
  }

  get containerWidth() {
    return this.getAbsoluteWidth(this.container);
  }

  get slottedWidth() {
    return this.getTabsFromSlot()?.reduce(
      (total, el) => total + this.getAbsoluteWidth(el),
      0
    );
  }

  get moreButtonWidth() {
    return this.moreButton ? this.getAbsoluteWidth(this.moreButton) : 0;
  }

  get overflowingTabs() {
    return this.getTabsFromSlot().filter((el) => {
      const containerRight = this.container.getBoundingClientRect().right;
      return (
        el.getBoundingClientRect().right >
        (this.isOverflow
          ? containerRight - this.moreButtonWidth
          : containerRight)
      );
    });
  }

  get displayedTabs() {
    return this.getTabsFromSlot().filter(
      (el) => !this.overflowingTabs.includes(el)
    );
  }

  get dropdownClasses() {
    return `slds-dropdown-trigger slds-dropdown-trigger_click ${
      this.isComboboxOpen && 'slds-is-open'
    }`;
  }

  get arrowIconName() {
    return this.isComboboxOpen ? 'utility:up' : 'utility:down';
  }

  get moreButton() {
    return this.template.querySelector('.tab-bar_more-button');
  }

  get moreButtonLabel() {
    return this.displayedTabs.length ? this.labels.more : this.labels.tabs;
  }

  get lastVisibleTab() {
    return this.displayedTabs[this.displayedTabs.length - 1];
  }

  get tabContainerRelativePosition() {
    return this.template
      .querySelector('.tab-bar_list-container')
      ?.getBoundingClientRect();
  }

  get lastVisibleTabRightPosition() {
    return (
      this.lastVisibleTab.getBoundingClientRect().right -
      this.tabContainerRelativePosition.left
    );
  }

  get lastVisibleTabLeftPosition() {
    return (
      this.lastVisibleTab.getBoundingClientRect().left -
      this.tabContainerRelativePosition.left
    );
  }

  /** Event Handlers */

  handleSlotChange() {
    this.updateTabVisibility();
  }

  handleDropdownTabSelect(event) {
    const targetValue = event.currentTarget.getAttribute('data-value');
    const clickedtab = this.overflowingTabs.find(
      (tab) => tab.expression === targetValue
    );
    clickedtab?.select();
    this.options = this.options.map((option) => {
      option.selected = option.value === targetValue;
      return option;
    });
  }

  handleClick() {
    this.isComboboxOpen = !this.isComboboxOpen;
  }

  handleTabSelected = (event) => {
    event.stopPropagation();
    this.options = this.options.map((option) => {
      option.selected = false;
      return option;
    });
  };

  /** Utils */

  getTabsFromSlot() {
    const isTab = (tagName) => /-quantic-tab$/i.test(tagName);
    return Array.from(this.querySelectorAll('*')).filter((element) =>
      isTab(element.tagName)
    );
  }

  getElementPadding(element) {
    var styles = window.getComputedStyle(element);
    return {
      top: parseFloat(styles.paddingTop),
      right: parseFloat(styles.paddingRight),
      bottom: parseFloat(styles.paddingBottom),
      left: parseFloat(styles.paddingLeft),
    };
  }

  getAbsoluteWidth(element) {
    var paddings = this.getElementPadding(element);
    var padding = paddings.left + paddings.right;

    return Math.ceil(element.offsetWidth + padding);
  }
}

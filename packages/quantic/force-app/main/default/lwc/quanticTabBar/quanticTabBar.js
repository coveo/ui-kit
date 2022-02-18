import {LightningElement} from 'lwc';

export default class QuanticTabBar extends LightningElement {
  hasRendered = false;
  isComboboxOpen = false;
  options = [];

  /** Lifecycle */

  connectedCallback() {
    window.addEventListener('resize', this.updateTabVisibility);
    this.addEventListener('tab_selected', this.handleTabSelected);
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
      this.overflowingTabs.forEach(
        (tabElement) => (tabElement.style.visibility = 'hidden')
      );
      this.updateComboboxOptions();
      this.moreButton?.style.setProperty(
        'left',
        `${this.lastVisibleTabRightPosition}px`
      );
    } else {
      this.hideMoreButton();
      this.isComboboxOpen = false;
      this.options = [];
      this.getTabsFromSlot().forEach(
        (tabElement) => (tabElement.style.visibility = 'visible')
      );
    }
    this.displayedTabs.forEach(
      (tabElement) => (tabElement.style.visibility = 'visible')
    );
  };

  updateComboboxOptions() {
    this.options = this.overflowingTabs.map((el) => ({
      label: el.label,
      value: el.expression,
      selected:
        this.options.find((option) => option.value === el.expression)
          ?.selected ?? false,
    }));
  }

  showMoreButton() {
    this.moreButton?.style.setProperty('display', 'block');
  }

  hideMoreButton() {
    this.moreButton?.style.setProperty('display', 'none');
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

  get lastVisibleTabRightPosition() {
    const lastTabRelativePosition =
      this.displayedTabs[this.displayedTabs.length - 1].getBoundingClientRect();
    const tabContainerRelativePosition = this.template
      .querySelector('.tab-bar_list-container')
      ?.getBoundingClientRect();

    return lastTabRelativePosition.right - tabContainerRelativePosition.left;
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

  handleBlur() {
    this.isComboboxOpen = false;
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

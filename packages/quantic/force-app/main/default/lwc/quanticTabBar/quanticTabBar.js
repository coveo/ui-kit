import {LightningElement} from 'lwc';

export default class QuanticTabBar extends LightningElement {
  hasRendered = false;
  showMore = false;
  isComboboxOpen = false;
  options = [];

  connectedCallback() {
    window.addEventListener('resize', this.updateTabVisibility);
  }

  updateTabVisibility = () => {
    if (this.slottedWidth > this.containerWidth) {
      this.showMore = true;
      this.overflowingTabs.forEach(
        (tabElement) => (tabElement.style.visibility = 'hidden')
      );
      this.updateComboboxOptions();
      console.log(this.lastVisibleTabRightPosition);
      this.moreButton?.style.setProperty(
        'left',
        `${this.lastVisibleTabRightPosition}px`
      );
    } else {
      this.showMore = false;
      this.options = [];
    }
    this.displayedTabs.forEach(
      (tabElement) => (tabElement.style.visibility = 'visible')
    );
  };

  updateComboboxOptions() {
    this.options = this.overflowingTabs.map((el) => ({
      label: el.label,
      value: el.expression,
    }));
  }

  logSizes() {
    console.log({
      container: this.containerWidth,
      slotted: this.slottedWidth,
    });
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

  get containerWidth() {
    return this.getAbsoluteWidth(
      this.template.querySelector('.tab-bar_container')
    );
  }

  get slottedWidth() {
    return this.getTabsFromSlot()?.reduce(
      (total, el) => total + this.getAbsoluteWidth(el),
      0
    );
  }

  get overflowingTabs() {
    return this.getTabsFromSlot().filter(
      (el) =>
        el.getBoundingClientRect().left + this.getAbsoluteWidth(el) >
        this.containerWidth
    );
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

  handleSlotChange() {
    this.updateTabVisibility();
  }

  handleChange(event) {
    const targetValue = event.currentTarget.getAttribute('data-value');
    const clickedtab = this.overflowingTabs.find(
      (tab) => tab.expression === targetValue
    );
    console.log(this.overflowingTabs);
    console.log(targetValue);
    clickedtab?.select();
  }

  handleClick() {
    this.isComboboxOpen = !this.isComboboxOpen;
  }

  tabSelectHandle() {}

  getTabsFromSlot() {
    const isTab = (tagName) => /-quantic-tab$/i.test(tagName);
    return Array.from(this.querySelectorAll('*')).filter((element) =>
      isTab(element.tagName)
    );
  }
}

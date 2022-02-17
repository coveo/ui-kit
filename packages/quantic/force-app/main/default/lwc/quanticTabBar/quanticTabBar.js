import {LightningElement} from 'lwc';

export default class QuanticTabBar extends LightningElement {
  hasRendered = false;
  showMore = false;
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
    } else {
      this.showMore = false;
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
    return this.getAbsoluteWidth(this.template.querySelector('.tab-container'));
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

  handleSlotChange() {
    this.updateTabVisibility();
  }

  handleChange(event) {
    const clickedtab = this.overflowingTabs.find(
      (tab) => tab.expression === event.detail.value
    );
    clickedtab?.select();
  }

  tabSelectHandle() {}

  getTabsFromSlot() {
    const isTab = (tagName) => /-quantic-tab$/i.test(tagName);
    return Array.from(this.querySelectorAll('*')).filter((element) =>
      isTab(element.tagName)
    );
  }
}

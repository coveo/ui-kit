import {h, Component, Element, Host, Listen, State} from '@stencil/core';
import {Button} from '../button';
import {TabCommonElement} from './tab-common';

/**
 * @internal
 */
@Component({
  tag: 'tab-bar',
  shadow: true,
  styleUrl: 'tab-bar.pcss',
})
export class TabBar {
  @Element() private host!: HTMLElement;

  @State()
  private popoverTabs: typeof Button[] = [];

  private resizeObserver: ResizeObserver | undefined;

  private get tabsFromSlot(): TabCommonElement[] {
    const isTab = (tagName: string) => /atomic-.+-tab$/i.test(tagName);
    return Array.from(this.host.querySelectorAll<TabCommonElement>('*')).filter(
      (element) => isTab(element.tagName)
    );
  }

  private get selectedTab() {
    return this.tabsFromSlot.find((tab) => tab.active);
  }

  private get slotContentWidth() {
    return this.tabsFromSlot.reduce(
      (total, el) =>
        total +
        parseFloat(window.getComputedStyle(el).getPropertyValue('width')),
      0
    );
  }

  private get containerWidth() {
    return parseFloat(
      window.getComputedStyle(this.host).getPropertyValue('width')
    );
  }

  private get isOverflow() {
    return this.slotContentWidth > this.containerWidth;
  }

  private get tabPopover() {
    return this.host.shadowRoot?.querySelector('tab-popover');
  }

  private get popoverWidth() {
    return this.tabPopover ? this.getElementWidth(this.tabPopover) : 0;
  }

  private get overflowingTabs() {
    const containerRelativeRightPosition =
      this.host.getBoundingClientRect().right;
    const selectedTabRelativeRightPosition =
      this.selectedTab?.getBoundingClientRect().right;

    return this.tabsFromSlot.filter((element) => {
      const isBeforeSelectedTab = selectedTabRelativeRightPosition
        ? selectedTabRelativeRightPosition >
          element.getBoundingClientRect().right
        : false;

      const minimumWidthNeeded = isBeforeSelectedTab
        ? this.popoverWidth + this.getElementWidth(this.selectedTab)
        : this.popoverWidth;

      const rightPositionLimit = !this.isOverflow
        ? containerRelativeRightPosition
        : containerRelativeRightPosition - minimumWidthNeeded;

      return (
        element.getBoundingClientRect().right > rightPositionLimit &&
        !element.active
      );
    });
  }

  private get displayedTabs() {
    return this.tabsFromSlot.filter((el) => !this.overflowingTabs.includes(el));
  }

  private get lastDisplayedTab() {
    const displayedTabs = this.displayedTabs;
    return displayedTabs[displayedTabs.length - 1];
  }

  private get lastDisplayedTabRightPosition() {
    return (
      this.lastDisplayedTab.getBoundingClientRect().right -
      this.host.getBoundingClientRect().left
    );
  }

  private updatePopoverPosition() {
    this.tabPopover?.style.setProperty(
      'left',
      `${this.displayedTabs.length ? this.lastDisplayedTabRightPosition : 0}px`
    );
  }

  private getElementWidth = (element?: Element) => {
    return element
      ? parseFloat(window.getComputedStyle(element).getPropertyValue('width'))
      : 0;
  };

  private hideElement = (el: HTMLElement) => {
    el.style.visibility = 'hidden';
    el.ariaHidden = 'true';
  };

  private showElement = (el: HTMLElement) => {
    el.style.visibility = 'visible';
    el.ariaHidden = 'false';
  };

  private updateTabVisibility = (
    tabs: TabCommonElement[],
    isVisible: boolean
  ) => {
    const tabCount = this.tabsFromSlot.length;

    tabs.forEach((tab, index) => {
      tab.style.setProperty(
        'order',
        String(isVisible ? index + 1 : tabCount - tabs.length + index + 1)
      );
      if (isVisible) {
        this.showElement(tab);
      } else {
        this.hideElement(tab);
      }
    });
  };

  private updatePopoverTabs = () => {
    this.popoverTabs = this.overflowingTabs.map((tab) => (
      <Button
        part="popover-tab"
        style="text-transparent"
        class="font-semibold px-4 py-2 rounded truncate"
        ariaLabel={tab.label}
        onClick={() => {
          tab.select();
          this.tabPopover?.togglePopover();
        }}
      >
        {tab.label}
      </Button>
    ));
  };

  private updateTabsDisplay = () => {
    this.updateTabVisibility(this.overflowingTabs, false);
    this.updateTabVisibility(this.displayedTabs, true);
    this.updatePopoverPosition();
    this.tabPopover?.setButtonVisibility(!!this.overflowingTabs.length);
  };

  @Listen('atomic/tabRendered')
  public resolveResult(event: CustomEvent<{}>) {
    event.stopPropagation();
    this.updatePopoverTabs();
  }

  public componentDidLoad() {
    this.resizeObserver = new ResizeObserver(this.render);
    this.resizeObserver.observe(this.host);
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  public render = () => {
    this.updateTabsDisplay();
    return (
      <Host>
        <slot></slot>
        <tab-popover>{this.popoverTabs}</tab-popover>
      </Host>
    );
  };
}

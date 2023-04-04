import {h, Component, Element, Host, Listen, State} from '@stencil/core';
import {Button} from '../button';

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

  private get tabsFromSlot(): HTMLAtomicInsightTabElement[] {
    const isTab = (tagName: string) => /atomic-.+-tab$/i.test(tagName);
    return Array.from(this.host.querySelectorAll('atomic-insight-tab')).filter(
      (element) => isTab(element.tagName)
    );
  }

  private get selectedTab() {
    return this.tabsFromSlot.find((el) => this.getIsTabActive(el));
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

  private get moreButton() {
    return this.host.querySelector('.more-button');
  }

  private get moreButtonWidth() {
    return this.moreButton ? this.getElementWidth(this.moreButton) : 0;
  }

  private get overflowingTabs() {
    const containerRelativeRightPosition =
      this.host.getBoundingClientRect().right;
    const selectedTabRelativeRightPosition =
      this.selectedTab?.getBoundingClientRect().right;

    return this.tabsFromSlot.filter((element) => {
      const tabPositionedBeforeSelectedTab = selectedTabRelativeRightPosition
        ? selectedTabRelativeRightPosition >
          element.getBoundingClientRect().right
        : null;

      const minimumWidthNeeded = tabPositionedBeforeSelectedTab
        ? this.moreButtonWidth + this.getElementWidth(this.selectedTab)
        : this.moreButtonWidth;

      const rightPositionLimit = !this.isOverflow
        ? containerRelativeRightPosition
        : containerRelativeRightPosition - minimumWidthNeeded;

      return (
        element.getBoundingClientRect().right > rightPositionLimit &&
        !this.getIsTabActive(element)
      );
    });
  }

  private get displayedTabs() {
    return this.tabsFromSlot.filter((el) => !this.overflowingTabs.includes(el));
  }

  private getIsTabActive = (element: Element) =>
    !!element.getAttribute('active');

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

  private updateTabsDisplay = () => {
    this.overflowingTabs.forEach(this.hideElement);
    this.displayedTabs.forEach(this.showElement);
    this.popoverTabs = this.overflowingTabs.map((tab) => (
      <Button
        style="text-transparent"
        class="font-semibold px-4 py-3 rounded truncate"
        onClick={() => tab.select()}
      >
        {tab.label}
      </Button>
    ));
  };

  @Listen('atomic/tabRendered')
  public resolveResult(event: CustomEvent<{}>) {
    event.stopPropagation();
    this.render();
  }

  public componentDidLoad() {
    window.addEventListener('resize', this.render);
  }

  public render = () => {
    this.updateTabsDisplay();
    return (
      <Host class="flex">
        <slot></slot>
        <tabs-popover>{this.popoverTabs}</tabs-popover>
      </Host>
    );
  };
}

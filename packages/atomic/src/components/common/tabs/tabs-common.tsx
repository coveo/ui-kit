import {h} from '@stencil/core';
import {Button} from '../button';
import {AnyBindings} from '../interface/bindings';

interface TabsCommonProps {
  host: HTMLElement;
}

export class TabsCommon {
  constructor(private props: TabsCommonProps) {
    window.addEventListener('resize', this.updateTabsDisplay);
  }

  get tabsFromSlot(): HTMLAtomicInsightTabElement[] {
    const isTab = (tagName: string) => /atomic-.+-tab$/i.test(tagName);
    return Array.from(
      this.props.host.querySelectorAll('atomic-insight-tab')
    ).filter((element) => isTab(element.tagName));
  }

  private getIsTabActive = (element: Element) =>
    !!element.getAttribute('active');

  get selectedTab() {
    return this.tabsFromSlot.find((el) => this.getIsTabActive(el));
  }

  get slotContentWidth() {
    return this.tabsFromSlot.reduce(
      (total, el) =>
        total +
        parseFloat(window.getComputedStyle(el).getPropertyValue('width')),
      0
    );
  }

  get containerWidth() {
    return parseFloat(
      window.getComputedStyle(this.props.host).getPropertyValue('width')
    );
  }

  get isOverflow() {
    return this.slotContentWidth > this.containerWidth;
  }

  get moreButton() {
    return this.props.host.querySelector('.more-button');
  }

  get moreButtonWidth() {
    return this.moreButton ? this.getElementWidth(this.moreButton) : 0;
  }

  private getElementWidth = (element?: Element) => {
    return element
      ? parseFloat(window.getComputedStyle(element).getPropertyValue('width'))
      : 0;
  };

  get overflowingTabs() {
    const containerRelativeRightPosition =
      this.props.host.getBoundingClientRect().right;
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

  get displayedTabs() {
    return this.tabsFromSlot.filter((el) => !this.overflowingTabs.includes(el));
  }

  public updateTabsDisplay = () => {
    console.log({
      containerWidth: this.containerWidth,
      slotContentWidth: this.slotContentWidth,
      displayedTabs: this.displayedTabs,
      overflowingTabs: this.overflowingTabs,
    });
  };

  public renderMoreButton = (bindings: AnyBindings) => {
    console.log(this.overflowingTabs);
    return (
      <tabs-popover bindings={bindings}>
        {this.overflowingTabs.map((tab) => (
          <Button
            style="text-transparent"
            class="font-semibold px-4 py-3 rounded truncate"
            onClick={() => tab.select()}
          >
            {tab.label}
          </Button>
        ))}
      </tabs-popover>
    );
  };
}

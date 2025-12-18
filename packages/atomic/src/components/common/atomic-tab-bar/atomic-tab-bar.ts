import {
  type CSSResultGroup,
  css,
  html,
  LitElement,
  type TemplateResult,
} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {errorGuard} from '@/src/decorators/error-guard';
import type {LitElementWithError} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import type {TabCommonElement} from '../tabs/tab-common';

interface TabPopoverElement extends HTMLElement {
  toggle: () => Promise<void>;
  setButtonVisibility: (isVisible: boolean) => Promise<void>;
}

/**
 * The `atomic-tab-bar` component is an internal component that manages tab overflow behavior.
 * When tabs exceed the available container width, overflowing tabs are moved to a popover menu.
 *
 * @internal
 * @slot default - The tab elements to display.
 */
@customElement('atomic-tab-bar')
@withTailwindStyles
export class AtomicTabBar extends LitElement implements LitElementWithError {
  error!: Error;
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

  :host {
    white-space: nowrap;
    width: 100%;
    overflow-x: visible;
    display: flex;
    position: relative;
  }`;

  @state()
  private popoverTabs: TemplateResult[] = [];

  private resizeObserver: ResizeObserver | undefined;

  private get tabsFromSlot(): TabCommonElement[] {
    const isTab = (tagName: string) =>
      /atomic-.+-tab$/i.test(tagName) || /tab-button$/i.test(tagName);
    return Array.from(this.querySelectorAll<TabCommonElement>('*')).filter(
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
    return parseFloat(window.getComputedStyle(this).getPropertyValue('width'));
  }

  private get isOverflow() {
    return this.slotContentWidth > this.containerWidth;
  }

  private get tabPopover() {
    return this.shadowRoot?.querySelector<TabPopoverElement>(
      'atomic-tab-popover'
    );
  }

  private get popoverWidth() {
    return this.tabPopover ? this.getElementWidth(this.tabPopover) : 0;
  }

  private get overflowingTabs() {
    const containerRelativeRightPosition = this.getBoundingClientRect().right;
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
      this.getBoundingClientRect().left
    );
  }

  connectedCallback() {
    super.connectedCallback();
    this.addEventListener(
      'atomic/tabRendered',
      this.handleTabRendered as EventListener
    );
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
    this.removeEventListener(
      'atomic/tabRendered',
      this.handleTabRendered as EventListener
    );
  }

  firstUpdated() {
    this.resizeObserver = new ResizeObserver(() => {
      this.updateTabsDisplay();
    });
    this.resizeObserver.observe(this);
  }

  willUpdate() {
    this.updateTabsDisplay();
  }

  @errorGuard()
  render() {
    return html`
      <slot></slot>
      <atomic-tab-popover
        exportparts="popover-button, value-label, arrow-icon, backdrop overflow-tabs"
      >
        ${this.popoverTabs}
      </atomic-tab-popover>
    `;
  }

  private handleTabRendered = (event: CustomEvent) => {
    event.stopPropagation();
    this.updatePopoverTabs();
  };

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
    this.popoverTabs = this.overflowingTabs.map(
      (tab) => html`
        <li>
          ${renderButton({
            props: {
              part: 'popover-tab',
              style: 'text-transparent',
              class:
                'w-full truncate rounded px-4 py-2 text-left font-semibold',
              ariaLabel: tab.label,
              title: tab.label,
              onClick: () => {
                tab.select();
                this.updatePopoverTabs();
                this.tabPopover?.toggle();
              },
            },
          })(html`${tab.label}`)}
        </li>
      `
    );
  };

  private setTabButtonMaxWidth = () => {
    this.displayedTabs.forEach((tab) => {
      tab.style.setProperty('max-width', `calc(100% - ${this.popoverWidth}px)`);
    });
  };

  private updateTabsDisplay = () => {
    this.updateTabVisibility(this.overflowingTabs, false);
    this.updateTabVisibility(this.displayedTabs, true);
    this.setTabButtonMaxWidth();
    this.updatePopoverPosition();
    this.updatePopoverTabs();
    this.tabPopover?.setButtonVisibility(!!this.overflowingTabs.length);
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-tab-bar': AtomicTabBar;
  }
}

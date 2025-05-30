import {Result} from '@coveo/headless';
import {Component, h, Element, Host} from '@stencil/core';
import {ResultContext} from '../result-template-decorators';

/**
 * The `atomic-result-fields-list` component selectively renders its children to ensure they fit the parent element and adds dividers between them.
 * @slot default - The children to render.
 */
@Component({
  tag: 'atomic-result-fields-list',
  styleUrl: 'atomic-result-fields-list.pcss',
  shadow: false,
})
export class AtomicResultFieldsList {
  @ResultContext()
  protected result!: Result;

  private resizeObserver?: ResizeObserver;

  private updatingChildren = false;
  private rows: number[] = [];
  @Element() private host!: HTMLElement;

  public connectedCallback() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => this.update());
      this.resizeObserver.observe(this.host.parentElement!);
    }
  }

  public disconnectedCallback() {
    this.resizeObserver?.disconnect();
  }

  public componentDidRender() {
    this.update();
  }

  public update() {
    if (this.updatingChildren) {
      return;
    }
    this.updatingChildren = true;
    this.showDividers();
    this.showChildren();
    this.hideChildrenToFit();
    this.hideDividersAtEndOfRows();
    this.updatingChildren = false;
  }

  private get hostChildren() {
    return Array.from(this.host.children) as HTMLElement[];
  }

  private get isOverflowing() {
    return (
      this.host.scrollWidth > this.host.clientWidth ||
      this.host.scrollHeight > this.host.clientHeight
    );
  }

  private getSortedChildrenBySize() {
    return this.hostChildren.sort((a, b) => a.offsetWidth - b.offsetWidth);
  }

  private hide(element: HTMLElement) {
    element.style.display = 'none';
  }

  private show(element: HTMLElement) {
    element.style.display = '';
  }

  private isChildHidden(element: HTMLElement) {
    return element.style.display === 'none';
  }

  private setHideDivider(element: HTMLElement, hideDivider: boolean) {
    element.classList.toggle('hide-divider', hideDivider);
  }

  private showChildren() {
    this.hostChildren.forEach((child) => this.show(child));
  }

  private showDividers() {
    this.hostChildren.forEach((child) => this.setHideDivider(child, false));
  }

  private hideChildrenToFit() {
    const children = this.getSortedChildrenBySize();
    for (let i = children.length - 1; this.isOverflowing && i >= 0; i--) {
      this.hide(children[i]);
    }
  }

  private hideDividersAtEndOfRows() {
    this.rows = [];
    let previousChild: HTMLElement | null = null;
    this.hostChildren
      .filter((child) => !this.isChildHidden(child))
      .forEach((child) => {
        const row = child.offsetTop;
        if (this.rows.indexOf(row) === -1) {
          this.rows.push(row);
          if (previousChild) {
            this.setHideDivider(previousChild, true);
          }
        }
        previousChild = child;
      });
    if (previousChild) {
      this.setHideDivider(previousChild, true);
    }
  }

  render() {
    return <Host></Host>;
  }
}

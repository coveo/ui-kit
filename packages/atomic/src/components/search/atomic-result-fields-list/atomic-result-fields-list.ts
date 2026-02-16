import type {FoldedResult, Result} from '@coveo/headless';
import {css, html, LitElement, type PropertyValues} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindings} from '@/src/decorators/bindings';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {SlotsForNoShadowDOMMixin} from '../../../mixins/slots-for-no-shadow-dom-mixin';
import '../atomic-result-text/atomic-result-text';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {errorGuard} from '@/src/decorators/error-guard';

/**
 * The `atomic-result-fields-list` component selectively renders its children to ensure they fit the parent element and adds dividers between them.
 * @slot default - The children to render.
 */
@customElement('atomic-result-fields-list')
@bindings()
export class AtomicResultFieldsList
  extends LightDomMixin(SlotsForNoShadowDOMMixin(LitElement))
  implements InitializableComponent<Bindings>
{
  static styles = css`
    atomic-result-fields-list {
      display: flex;
      flex-wrap: wrap;
      width: 100%;
      height: 100%;
    }

    atomic-result-fields-list > *::after {
      display: block;
      content: ' ';
      width: 1px;
      height: 1rem;
      margin: 0 1rem;
      background-color: var(--atomic-neutral);
      vertical-align: middle;
    }

    atomic-result-fields-list > *.hide-divider::after {
      visibility: hidden;
    }
  `;

  @state() public bindings!: Bindings;
  @state() public error!: Error;

  @state() private result!: Result | FoldedResult;

  private resultController = createResultContextController(this);
  private resizeObserver?: ResizeObserver;
  private updatingChildren = false;
  private rows: number[] = [];

  connectedCallback() {
    super.connectedCallback();
    if (window.ResizeObserver && this.parentElement) {
      this.resizeObserver = new ResizeObserver(() => this.updateLayout());
      this.resizeObserver.observe(this.parentElement);
    }
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.resizeObserver?.disconnect();
  }

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item;
      }
    }
  }

  protected updated(_changedProperties: PropertyValues): void {
    super.updated(_changedProperties);
    this.updateLayout();
  }

  private updateLayout() {
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
    return Array.from(this.children) as HTMLElement[];
  }

  private get isOverflowing() {
    return (
      this.scrollWidth > this.clientWidth ||
      this.scrollHeight > this.clientHeight
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

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${this.renderDefaultSlotContent()}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-fields-list': AtomicResultFieldsList;
  }
}

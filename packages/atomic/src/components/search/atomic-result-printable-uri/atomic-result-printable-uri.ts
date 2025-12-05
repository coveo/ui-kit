import {NumberValue, Schema} from '@coveo/bueno';
import {
  buildInteractiveResult,
  type InteractiveResult,
  type Result,
} from '@coveo/headless';
import {html, LitElement, nothing, type TemplateResult} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import {getAttributesFromLinkSlotContent} from '@/src/components/common/item-link/attributes-slot';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import {ValidatePropsController} from '@/src/components/common/validate-props-controller/validate-props-controller';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {createResultContextController} from '@/src/components/search/result-template-component-utils/context/result-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {parseXML} from '@/src/utils/utils';
import Arrow from '../../../images/arrow-right.svg';
import '../atomic-result-text/atomic-result-text';
import '../../common/atomic-icon/atomic-icon';
import styles from './atomic-result-printable-uri.tw.css';

/**
 * The `atomic-result-printable-uri` component displays the URI, or path, to access a result.
 *
 * @slot attributes - Lets you pass [attributes](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#attributes) down to anchor elements, overriding other attributes.
 * To be used exclusively in anchor elements, such as: `<a slot="attributes" target="_blank" download></a>`.
 */
@customElement('atomic-result-printable-uri')
@bindings()
export class AtomicResultPrintableUri
  extends LightDomMixin(LitElement)
  implements InitializableComponent<Bindings>
{
  static styles = styles;

  /**
   * The maximum number of Uri parts to display. This has to be over the minimum of `3` in order to be effective. Putting `Infinity` will disable the ellipsis.
   */
  @property({type: Number, reflect: true, attribute: 'max-number-of-parts'})
  maxNumberOfParts = 5;

  @state() public bindings!: Bindings;
  @state() public error!: Error;
  @state() private listExpanded = false;
  @state() private result!: Result;

  private resultController = createResultContextController(this);
  private interactiveResult!: InteractiveResult;
  private linkAttributes?: Attr[];
  private expandedPartElement?: HTMLAnchorElement;
  private linkCleanupCallbacks: (() => void)[] = [];

  constructor() {
    super();

    new ValidatePropsController(
      this,
      () => ({maxNumberOfParts: this.maxNumberOfParts}),
      new Schema({
        maxNumberOfParts: new NumberValue({min: 3}),
      })
    );
  }

  connectedCallback() {
    super.connectedCallback();
    const slotName = 'attributes';
    this.linkAttributes = getAttributesFromLinkSlotContent(this, slotName);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.cleanupLinkCallbacks();
  }

  public initialize() {
    if (!this.result && this.resultController.item) {
      const item = this.resultController.item;
      if ('result' in item) {
        this.result = item.result;
      } else {
        this.result = item as Result;
      }
    }

    if (this.result) {
      this.interactiveResult = buildInteractiveResult(this.bindings.engine, {
        options: {result: this.result},
      });
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.result, () => this.renderPrintableUri())}`;
  }

  private cleanupLinkCallbacks() {
    this.linkCleanupCallbacks.forEach((cleanup) => cleanup());
    this.linkCleanupCallbacks = [];
  }

  private registerLinkCleanup = (cleanup: () => void) => {
    this.linkCleanupCallbacks.push(cleanup);
  };

  private getIndexOfEllipsis(parentsCount: number) {
    const valuesToHide = Math.max(2, parentsCount - this.maxNumberOfParts);
    const valuesToShowBeforeEllipsis = parentsCount - valuesToHide - 1;
    return valuesToShowBeforeEllipsis;
  }

  private renderEllipsis() {
    return html`
      <li>
        <button
          aria-label=${this.bindings.i18n.t('collapsed-uri-parts')}
          aria-expanded=${this.listExpanded}
          @click=${(e: Event) => {
            e.stopPropagation();
            this.listExpanded = true;
            // Focus on the previously hidden link after expansion
            requestAnimationFrame(() => {
              this.expandedPartElement?.focus();
            });
          }}
        >
          ...
        </button>
        ${this.renderSeparator()}
      </li>
    `;
  }

  private get allParents() {
    const parentsXml = parseXML(`${this.result.raw.parents}`);
    const parents = Array.from(parentsXml.getElementsByTagName('parent'));
    const ellipsisIndex = this.getIndexOfEllipsis(parents.length);
    return parents.map((parent, i) => {
      const name = parent.getAttribute('name');
      const uri = parent.getAttribute('uri')!;
      return {
        name,
        uri,
        isEllipsisTarget: i === ellipsisIndex,
        isLast: i === parents.length - 1,
      };
    });
  }

  private renderSeparator() {
    return html`
      <atomic-icon
        class="result-printable-uri-separator"
        .icon=${Arrow}
        role="separator"
      ></atomic-icon>
    `;
  }

  private renderParents() {
    const parents = this.allParents;
    if (this.listExpanded || parents.length <= this.maxNumberOfParts) {
      return parents.map((parent) => this.renderParentListItem(parent));
    }

    const ellipsisIndex = this.getIndexOfEllipsis(parents.length);
    return html`
      ${parents
        .slice(0, ellipsisIndex)
        .map((parent) => this.renderParentListItem(parent))}
      ${this.renderEllipsis()}
      ${parents.slice(-1).map((parent) => this.renderParentListItem(parent))}
    `;
  }

  private renderParentListItem(parent: {
    name: string | null;
    uri: string;
    isEllipsisTarget: boolean;
    isLast: boolean;
  }) {
    return html`
      <li>
        ${this.renderLink(parent.name, parent.uri, parent.isEllipsisTarget)}
        ${parent.isLast ? nothing : this.renderSeparator()}
      </li>
    `;
  }

  private renderLink(
    content: string | null,
    uri: string,
    shouldSetTarget: boolean
  ): TemplateResult | typeof nothing {
    return renderLinkWithItemAnalytics({
      props: {
        href: uri,
        title: content ?? undefined,
        onSelect: () => this.interactiveResult.select(),
        onBeginDelayedSelect: () => this.interactiveResult.beginDelayedSelect(),
        onCancelPendingSelect: () =>
          this.interactiveResult.cancelPendingSelect(),
        attributes: this.linkAttributes,
        ref: shouldSetTarget
          ? (el?: HTMLAnchorElement) => {
              if (el) {
                this.expandedPartElement = el;
              }
            }
          : undefined,
        onInitializeLink: this.registerLinkCleanup,
      },
    })(content ? html`${content}` : nothing);
  }

  private renderPrintableUri() {
    const parents = this.allParents;
    if (parents.length) {
      return html`
        <ul aria-label=${this.bindings.i18n.t('printable-uri')}>
          ${this.renderParents()}
        </ul>
      `;
    }

    return renderLinkWithItemAnalytics({
      props: {
        href: this.result.clickUri,
        onSelect: () => this.interactiveResult.select(),
        onBeginDelayedSelect: () => this.interactiveResult.beginDelayedSelect(),
        onCancelPendingSelect: () =>
          this.interactiveResult.cancelPendingSelect(),
        attributes: this.linkAttributes,
        onInitializeLink: this.registerLinkCleanup,
      },
    })(html`<atomic-result-text field="printableUri"></atomic-result-text>`);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-printable-uri': AtomicResultPrintableUri;
  }
}

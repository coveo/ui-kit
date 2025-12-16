import type {Result} from '@coveo/headless';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {renderLinkWithItemAnalytics} from '@/src/components/common/item-link/item-link';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {LightDomMixin} from '@/src/mixins/light-dom';
import {buildCustomEvent} from '@/src/utils/event-utils';
import '@/src/components/search/atomic-result-text/atomic-result-text';

/**
 * The `atomic-smart-snippet-source` component displays the source information for a smart snippet.
 * @part source-url - The clickable URL of the source.
 * @part source-title - The clickable title of the source.
 * @internal
 */
@customElement('atomic-smart-snippet-source')
@bindings()
export class AtomicSmartSnippetSource
  extends LightDomMixin(LitElement)
  implements InitializableComponent<AnyBindings>
{
  static styles: CSSResultGroup =
    css`@reference '../../../../utils/tailwind.global.tw.css';`;

  /**
   * The search result source.
   */
  @property({reflect: true, type: Object})
  public source!: Result;

  /**
   * The attributes to apply to the anchor elements.
   */
  @property({type: Array})
  public anchorAttributes?: Attr[];

  @state() public bindings!: AnyBindings;
  @state() public error!: Error;

  public initialize() {
    // Dispatch custom event to provide result context
    this.addEventListener(
      'atomic/resolveResult',
      this.handleResolveResult as EventListener
    );
  }

  connectedCallback() {
    super.connectedCallback();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    this.removeEventListener(
      'atomic/resolveResult',
      this.handleResolveResult as EventListener
    );
  }

  private handleResolveResult = (event: CustomEvent) => {
    event.preventDefault();
    event.stopPropagation();
    if (this.source) {
      event.detail(this.source);
    }
  };

  private dispatchSelectEvent(eventName: string) {
    this.dispatchEvent(buildCustomEvent(eventName, undefined));
  }

  @errorGuard()
  render() {
    return html`${when(
      this.source,
      () => html`
        ${renderLinkWithItemAnalytics({
          props: {
            title: this.source.clickUri,
            href: this.source.clickUri,
            className: 'block truncate',
            part: 'source-url',
            attributes: this.anchorAttributes,
            onSelect: () => this.dispatchSelectEvent('selectSource'),
            onBeginDelayedSelect: () =>
              this.dispatchSelectEvent('beginDelayedSelectSource'),
            onCancelPendingSelect: () =>
              this.dispatchSelectEvent('cancelPendingSelectSource'),
          },
        })(html`${this.source.clickUri}`)}
        ${renderLinkWithItemAnalytics({
          props: {
            title: this.source.title,
            href: this.source.clickUri,
            attributes: this.anchorAttributes,
            className: 'block',
            part: 'source-title',
            onSelect: () => this.dispatchSelectEvent('selectSource'),
            onBeginDelayedSelect: () =>
              this.dispatchSelectEvent('beginDelayedSelectSource'),
            onCancelPendingSelect: () =>
              this.dispatchSelectEvent('cancelPendingSelectSource'),
          },
        })(
          html`<atomic-result-text
            field="title"
            default="no-title"
            key=${this.source.uniqueId}
          ></atomic-result-text>`
        )}
      `
    )}`;
  }
}

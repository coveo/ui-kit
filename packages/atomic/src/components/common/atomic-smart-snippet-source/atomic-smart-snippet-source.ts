import type {Result} from '@coveo/headless';
import {html, LitElement} from 'lit';
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
import {bindingGuard} from '@/src/decorators/binding-guard';

/**
 * The `atomic-smart-snippet-source` component displays the source information for a smart snippet.
 * @part source-url - The clickable URL of the source.
 * @part source-title - The clickable title of the source.
 * @event select-source - Emitted when the source link is selected.
 * @event begin-delayed-select-source - Emitted when a delayed source selection begins.
 * @event cancel-delayed-select-source - Emitted when a pending source selection is cancelled.
 * @internal
 */
@customElement('atomic-smart-snippet-source')
@bindings()
export class AtomicSmartSnippetSource
  extends LightDomMixin(LitElement)
  implements InitializableComponent<AnyBindings>
{
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

  /**
   * @deprecated Only here to support backward compatibility with Stencil components. Lit components should listen to the event using the `@on-select-source` expression instead.
   * Callback function for when the source is selected (backward compatibility).
   */
  @property({attribute: 'onSelectSource'})
  public onSelectSource?: () => void;

  /**
   * @deprecated Only here to support backward compatibility with Stencil components. Lit components should listen to the event using the `@on-begin-delayed-select-source` expression instead.
   * Callback function for when a delayed source selection begins (backward compatibility).
   */
  @property({attribute: 'onBeginDelayedSelectSource'})
  public onBeginDelayedSelectSource?: () => void;

  /**
   * @deprecated Only here to support backward compatibility with Stencil components. Lit components should listen to the event using the `@on-cancel-pending-select-source` expression instead.
   * Callback function for when a pending source selection is cancelled (backward compatibility).
   */
  @property({attribute: 'onCancelPendingSelectSource'})
  public onCancelPendingSelectSource?: () => void;

  @state() public bindings!: AnyBindings;
  @state() public error!: Error;

  public initialize() {
    this.addEventListener(
      'atomic/resolveResult',
      this.handleResolveResult as EventListener
    );
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

  private dispatchSourceEvent(eventName: string) {
    this.dispatchEvent(buildCustomEvent(eventName));
  }

  private handleSourceEvent(
    eventName:
      | 'select-source'
      | 'begin-delayed-select-source'
      | 'cancel-pending-select-source'
  ) {
    // Dispatch event for Lit components
    this.dispatchSourceEvent(eventName);

    // Call callback for Stencil backward compatibility
    switch (eventName) {
      case 'select-source':
        this.onSelectSource?.();
        break;
      case 'begin-delayed-select-source':
        this.onBeginDelayedSelectSource?.();
        break;
      case 'cancel-pending-select-source':
        this.onCancelPendingSelectSource?.();
        break;
    }
  }

  @errorGuard()
  @bindingGuard()
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
            onSelect: () => this.handleSourceEvent('select-source'),
            onBeginDelayedSelect: () =>
              this.handleSourceEvent('begin-delayed-select-source'),
            onCancelPendingSelect: () =>
              this.handleSourceEvent('cancel-pending-select-source'),
          },
        })(html`${this.source.clickUri}`)}
        ${renderLinkWithItemAnalytics({
          props: {
            title: this.source.title,
            href: this.source.clickUri,
            attributes: this.anchorAttributes,
            className: 'block',
            part: 'source-title',
            onSelect: () => this.handleSourceEvent('select-source'),
            onBeginDelayedSelect: () =>
              this.handleSourceEvent('begin-delayed-select-source'),
            onCancelPendingSelect: () =>
              this.handleSourceEvent('cancel-pending-select-source'),
          },
        })(
          html`<atomic-result-text
            field="title"
            default="no-title"
          ></atomic-result-text>`
        )}
      `
    )}`;
  }
}

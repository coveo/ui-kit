import {getOrganizationEndpoint} from '@coveo/headless';
import {html, LitElement, nothing} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {renderButton} from '@/src/components/common/button';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import '@/src/components/common/atomic-modal/atomic-modal';
import type {Bindings} from '@/src/components/search/atomic-search-interface/interfaces';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';

/**
 * The `atomic-relevance-inspector` component is used internally to offer insight on search page relevance, as well as information to help troubleshoot issues during development.
 *
 * @internal
 */
@customElement('atomic-relevance-inspector')
@bindings()
@withTailwindStyles
export class AtomicRelevanceInspector extends LitElement {
  /**
   * The Atomic interface bindings, namely the headless search engine and i18n instances.
   */
  @property({type: Object})
  bindings!: Bindings;
  error!: Error;
  initialize = () => {};

  @property({type: Boolean, reflect: true, converter: booleanConverter})
  open = false;

  private closeRelevanceInspector() {
    this.open = false;
    this.dispatchEvent(
      new CustomEvent('atomic/relevanceInspector/close', {
        bubbles: true,
        composed: true,
        detail: null,
      })
    );
  }

  private get adminHref() {
    const {organizationId, environment} =
      this.bindings.engine.state.configuration;

    const admin = getOrganizationEndpoint(organizationId, environment, 'admin');
    const {searchResponseId} = this.bindings.engine.state.search;
    return `${admin}/admin/#/${organizationId}/search/relevanceInspector/${searchResponseId}`;
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`
      <atomic-modal
        .isOpen=${this.open}
        @close=${() => this.closeRelevanceInspector()}
        exportparts="footer"
      >
        <p slot="header">Open the relevance inspector</p>
        <p slot="body">
          The Relevance Inspector will open in the Coveo Administration Console.
        </p>
        <div slot="footer" class="flex w-full items-center justify-end">
          ${renderButton({
            props: {
              style: 'outline-primary',
              class: 'mr-2 p-2',
              onClick: () => this.closeRelevanceInspector(),
              text: 'Ignore',
            },
          })(nothing)}
          ${renderButton({
            props: {
              style: 'primary',
              class: 'p-2',
              onClick: () => {
                window.open(this.adminHref, '_blank');
                this.closeRelevanceInspector();
              },
              text: 'Open',
            },
          })(nothing)}
        </div>
      </atomic-modal>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-relevance-inspector': AtomicRelevanceInspector;
  }
}

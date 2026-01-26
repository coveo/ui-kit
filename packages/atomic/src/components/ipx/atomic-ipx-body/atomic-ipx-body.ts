import {type CSSResultGroup, css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings';
import {booleanConverter} from '@/src/converters/boolean-converter';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {randomID} from '@/src/utils/utils';

/**
 * The `atomic-ipx-body` component provides a structured layout for IPX (In-Product Experience) interfaces.
 * It includes slots for header, body, and footer content.
 *
 * @internal
 *
 * @part container - The main container element
 * @part header-wrapper - The wrapper around the header section
 * @part header - The header content container
 * @part header-ruler - The horizontal rule separating header and body
 * @part body-wrapper - The wrapper around the body section (scrollable)
 * @part body - The body content container
 * @part footer-wrapper - The wrapper around the footer section
 * @part footer - The footer content container
 *
 * @event animationEnded - Emitted when the container animation ends
 *
 * @slot header - Content displayed in the header area
 * @slot body - Main content displayed in the scrollable body area
 * @slot footer - Content displayed in the footer area (conditionally rendered)
 */
@customElement('atomic-ipx-body')
@bindings()
@withTailwindStyles
export class AtomicIPXBody
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles: CSSResultGroup = [
    css`
      :host {
        position: relative;
        overflow: hidden;
        height: inherit;
        max-height: calc(100vh - 4.25rem);
      }

      [part='container'] {
        border-radius: 0.375rem;
        background-color: var(--atomic-background);
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        overflow: hidden;
        grid-area: modal;
        height: inherit;
        box-shadow: rgb(0 0 0 / 50%) 0 0 0.5rem;
        max-height: calc(100vh - 4.25rem);
      }

      [part='header-wrapper'] {
        background-color: var(--atomic-neutral-light);
        display: grid;
        width: 100%;
        padding: 1.5rem 1.5rem 0 1.5rem;
      }

      [part='header'] {
        font-weight: bold;
        min-width: 0;
      }

      [part='body-wrapper'] {
        padding: 1rem 1.5rem 1rem 1.5rem;
      }

      [part='footer-wrapper'] {
        background-color: var(--atomic-neutral-light);
        align-items: stretch;
        padding: 1rem 1.75rem;
      }

      /* Chrome, Edge & Safari */
      .scrollbar::-webkit-scrollbar {
        width: 0.8rem;
      }

      .scrollbar::-webkit-scrollbar-track {
        background: var(--atomic-background);
      }

      .scrollbar::-webkit-scrollbar-thumb {
        background: var(--atomic-primary);
        border: 0.15rem solid var(--atomic-background);
        border-radius: 100vh;
      }

      .scrollbar::-webkit-scrollbar-thumb:hover {
        background: var(--atomic-primary-light);
      }

      /* Firefox */
      .scrollbar {
        scrollbar-color: var(--atomic-primary) var(--atomic-background);
        scrollbar-width: auto;
      }
    `,
  ];

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  /**
   * Whether the modal is open. When undefined, the component is in embedded mode.
   */
  @property({type: Boolean, attribute: 'is-open'})
  isOpen?: boolean;

  /**
   * Whether to display the footer slot.
   */
  @property({
    type: Boolean,
    converter: booleanConverter,
    reflect: true,
    attribute: 'display-footer-slot',
  })
  displayFooterSlot = true;

  connectedCallback() {
    super.connectedCallback();
    if (!this.id) {
      this.id = randomID('atomic-ipx-body-');
    }
  }

  @errorGuard()
  render() {
    const isEmbedded = this.isOpen === undefined;
    const visibilityClass = isEmbedded
      ? ''
      : this.isOpen
        ? 'visible'
        : 'invisible';

    return html`
      <article
        part="container"
        class=${visibilityClass}
        @animationend=${this.handleAnimationEnd}
      >
        <header part="header-wrapper" class="flex flex-col items-center">
          <div part="header">
            <slot name="header"></slot>
          </div>
        </header>
        <hr part="header-ruler" class="border-neutral" />
        <div
          part="body-wrapper"
          class="scrollbar flex w-full grow flex-col overflow-auto"
        >
          <div part="body" class="w-full">
            <slot name="body"></slot>
          </div>
        </div>
        ${this.displayFooterSlot ? this.renderFooter() : nothing}
      </article>
    `;
  }

  private renderFooter() {
    return html`
      <footer
        part="footer-wrapper"
        class="border-neutral bg-background z-10 flex w-full flex-col items-center border-t"
      >
        <div part="footer">
          <slot name="footer"></slot>
        </div>
      </footer>
    `;
  }

  private handleAnimationEnd() {
    this.dispatchEvent(
      new CustomEvent('animationEnded', {
        bubbles: true,
        composed: true,
      })
    );
  }
}

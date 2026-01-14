import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings.js';
import {bindings} from '@/src/decorators/bindings.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils.js';
import {once, randomID} from '@/src/utils/utils.js';

/**
 * The `atomic-ipx-embedded` component is an internal component used for IPX embedded interfaces.
 *
 * @internal
 *
 * @part backdrop - The backdrop container element.
 */
@customElement('atomic-ipx-embedded')
@bindings()
@withTailwindStyles
export class AtomicIPXEmbedded
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles: CSSResultGroup = [
    css`
      :host {
        box-shadow: rgb(0 0 0 / 50%) 0 0 0.5rem;
        height: inherit;
      }

      [part='backdrop'] {
        @apply pointer-events-auto;
        height: inherit;
        inset: auto 3rem 4.25rem auto;
      }
    `,
  ];

  @state()
  public bindings!: AnyBindings;

  @state()
  public error!: Error;

  /**
   * The container to hide from the tabindex and accessibility DOM when the modal is closed.
   */
  @property({type: Object})
  container?: HTMLElement;

  @state()
  private hasFooterSlotElements = true;

  private updateBreakpoints = once(() => updateBreakpoints(this));

  public initialize() {
    // Initialize component
  }

  connectedCallback() {
    super.connectedCallback();
    this.checkFooterSlot();
    this.ensureHostId();
  }

  private checkFooterSlot() {
    this.hasFooterSlotElements = !!this.querySelector('[slot="footer"]');
  }

  private ensureHostId() {
    if (!this.id) {
      this.id = randomID('atomic-ipx-embedded-');
    }
  }

  render() {
    this.updateBreakpoints();

    return html`
      <div part="backdrop">
        <atomic-ipx-body .displayFooterSlot=${this.hasFooterSlotElements}>
          <slot name="header" slot="header"></slot>
          <slot name="body" slot="body"></slot>
          <slot name="footer" slot="footer"></slot>
        </atomic-ipx-body>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-embedded': AtomicIPXEmbedded;
  }
}

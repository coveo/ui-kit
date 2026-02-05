import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import type {AnyBindings} from '@/src/components/common/interface/bindings.js';
import {renderIpxBody} from '@/src/components/ipx/atomic-ipx-body/ipx-body.js';
import {ipxBodyStyles} from '@/src/components/ipx/atomic-ipx-body/ipx-body-styles.js';
import {bindings} from '@/src/decorators/bindings.js';
import type {InitializableComponent} from '@/src/decorators/types.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';
import {updateBreakpoints} from '@/src/utils/replace-breakpoint-utils.js';
import {once, randomID} from '@/src/utils/utils.js';

/**
 * The `atomic-ipx-embedded` component is used for IPX embedded interfaces.
 *
 * @slot header - Content to display in the header section.
 * @slot body - Content to display in the body section.
 * @slot footer - Content to display in the footer section.
 *
 * @part backdrop - The backdrop container element.
 * @part container - The content container element.
 * @part header-wrapper - The wrapper around the header section.
 * @part header - The header content container.
 * @part header-ruler - The horizontal rule separating header and body.
 * @part body-wrapper - The wrapper around the body section (scrollable).
 * @part body - The body content container.
 * @part footer-wrapper - The wrapper around the footer section.
 * @part footer - The footer content container.
 */
@customElement('atomic-ipx-embedded')
@bindings()
@withTailwindStyles
export class AtomicIpxEmbedded
  extends LitElement
  implements InitializableComponent<AnyBindings>
{
  static styles: CSSResultGroup = [
    ipxBodyStyles,
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

  public initialize() {}

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
        ${renderIpxBody({
          props: {
            visibility: 'embedded',
            displayFooterSlot: this.hasFooterSlotElements,
            header: html`<slot name="header"></slot>`,
            body: html`<slot name="body"></slot>`,
            footer: html`<slot name="footer"></slot>`,
          },
        })}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-ipx-embedded': AtomicIpxEmbedded;
  }
}

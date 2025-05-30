import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {LitElement, html, CSSResultGroup, unsafeCSS} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {DEFAULT_MOBILE_BREAKPOINT} from '../../../utils/replace-breakpoint';
import {randomID} from '../../../utils/stencil-utils';
import type {CommerceBindings} from '../atomic-commerce-interface/atomic-commerce-interface';
import styles from './atomic-commerce-layout.tw.css';
import {buildCommerceLayout} from './commerce-layout';

/**
 * @alpha
 * The `atomic-commerce-layout` helps organize elements in the commerce page.
 */
@customElement('atomic-commerce-layout')
@bindings()
@withTailwindStyles
export class AtomicCommerceLayout
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  @state() bindings!: CommerceBindings;

  @state() error!: Error;

  static styles: CSSResultGroup = [unsafeCSS(styles)];

  /**
   * CSS value that defines where the layout goes from mobile to desktop.
   * e.g., 800px, 65rem.
   */
  @property({type: String, reflect: true})
  mobileBreakpoint: string = DEFAULT_MOBILE_BREAKPOINT;

  connectedCallback() {
    super.connectedCallback();
    if (!this.id) {
      this.id = randomID('atomic-commerce-layout-');
    }
    const styleSheet = new CSSStyleSheet();
    styleSheet.replaceSync(buildCommerceLayout(this, this.mobileBreakpoint));
    this.bindings?.addAdoptedStyleSheets(styleSheet);
  }

  createRenderRoot() {
    return this;
  }

  @errorGuard()
  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-commerce-layout': AtomicCommerceLayout;
  }
}

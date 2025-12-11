import {css, html, LitElement, nothing} from 'lit';
import {customElement, property, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import ArrowDown from '@/images/arrow-down.svg';
import type {AnyBindings} from '@/src/components/interface/bindings';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {multiClassMap, tw} from '@/src/directives/multi-class-map';
import {InitializeBindingsMixin} from '@/src/mixins/bindings-mixin';
import {withTailwindStyles} from '@/src/mixins/tailwind-styles';

/**
 * @internal
 */
@customElement('atomic-smart-snippet-collapse-wrapper')
@bindings()
@withTailwindStyles
export class AtomicSmartSnippetCollapseWrapper
  extends InitializeBindingsMixin(LitElement)
  implements InitializableComponent<AnyBindings>
{
  static styles = css`
    @reference '../../../../utils/tailwind.global.tw.css';

    :host {
      display: block;
    }

    :host(.invisible) {
      visibility: hidden;
    }

    .smart-snippet-content {
      height: auto;
      max-height: var(--collapsed-size);
      transition: max-height 2s cubic-bezier(0, 1, 0.16, 1) -1.82s;
      
      --gradient-start: var(
        --atomic-smart-snippet-gradient-start,
        calc(max(var(--collapsed-size) - (var(--line-height) * 1.5), var(--collapsed-size) * 0.5))
      );
      
      mask-image: linear-gradient(black, black var(--gradient-start), transparent 100%);
    }

    :host(.expanded) .smart-snippet-content {
      height: auto;
      max-height: 9999999px;
      transition: max-height 2s cubic-bezier(1, 0, 1, 0) 0s;
      mask-image: none;
    }

    :host(.expanded) button atomic-icon {
      transform: scaleY(-1);
    }
  `;

  @state()
  bindings!: AnyBindings;

  @state()
  error!: Error;

  /**
   * The maximum height in pixels.
   */
  @property({type: Number, reflect: true, attribute: 'maximum-height'})
  maximumHeight?: number;

  /**
   * The collapsed height in pixels.
   */
  @property({type: Number, reflect: true, attribute: 'collapsed-height'})
  collapsedHeight?: number;

  @state()
  private isExpanded = true;

  @state()
  private showButton = true;

  @state()
  private fullHeight?: number;

  private shouldRenderButton = false;

  // Lifecycle methods

  connectedCallback() {
    super.connectedCallback();
    this.shouldRenderButton = !!this.maximumHeight;
  }

  // Public methods

  public initialize() {
    this.validateProps();
  }

  // Private methods

  private validateProps() {
    if (
      this.maximumHeight &&
      (!this.collapsedHeight || this.maximumHeight < this.collapsedHeight)
    ) {
      throw new Error(
        'snippetMaximumHeight must be equal or greater than snippetCollapsedHeight'
      );
    }
  }

  private initializeFullHeight() {
    this.fullHeight = this.getBoundingClientRect().height;
    this.showButton = this.fullHeight! > this.maximumHeight!;
    this.isExpanded = !this.showButton;
    this.style.setProperty('--collapsed-size', `${this.collapsedHeight}px`);
  }

  private toggleExpanded() {
    this.isExpanded = !this.isExpanded;
  }

  private renderButton() {
    if (!this.showButton) {
      return nothing;
    }

    return html`
      <button
        @click=${this.toggleExpanded}
        class=${multiClassMap(
          tw({
            'text-primary mb-4 hover:underline': true,
          })
        )}
        part=${this.isExpanded ? 'show-less-button' : 'show-more-button'}
      >
        ${this.bindings.i18n.t(this.isExpanded ? 'show-less' : 'show-more')}
        <atomic-icon
          icon=${ArrowDown}
          class=${multiClassMap(
            tw({
              'ml-2 w-3 align-baseline': true,
            })
          )}
        ></atomic-icon>
      </button>
    `;
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (this.fullHeight === undefined && this.shouldRenderButton) {
      this.initializeFullHeight();
    }
  }

  @errorGuard()
  render() {
    const hostClass = tw({
      expanded:
        this.isExpanded && (this.fullHeight || !this.shouldRenderButton),
      invisible: !this.fullHeight && this.shouldRenderButton,
    });

    this.className = multiClassMap(hostClass);

    return html`
      <div
        part="smart-snippet-collapse-wrapper"
        class=${multiClassMap(
          tw({
            'block overflow-hidden text-lg text-on-background smart-snippet-content': true,
          })
        )}
      >
        <slot></slot>
      </div>
      ${when(this.shouldRenderButton, () => this.renderButton())}
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-smart-snippet-collapse-wrapper': AtomicSmartSnippetCollapseWrapper;
  }
}

import type {SpotlightContent} from '@coveo/headless/commerce';
import {type CSSResultGroup, css, html, LitElement} from 'lit';
import {customElement, state} from 'lit/decorators.js';
import {when} from 'lit/directives/when.js';
import type {CommerceBindings} from '@/src/components/commerce/atomic-commerce-interface/atomic-commerce-interface';
import {createSpotlightContentContextController} from '@/src/components/commerce/spotlight-content-template-component-utils/context/spotlight-content-context-controller';
import {bindingGuard} from '@/src/decorators/binding-guard';
import {bindings} from '@/src/decorators/bindings';
import {errorGuard} from '@/src/decorators/error-guard';
import type {InitializableComponent} from '@/src/decorators/types';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';
import {filterProtocol} from '@/src/utils/xss-utils';

/**
 * The `atomic-spotlight-content-image` component renders the image of a Spotlight Content item. It displays the
 * `mobileImage`, when available, on viewports narrower than the interface mobile breakpoint, and the `desktopImage` otherwise.
 *
 * @part image - The image element.
 */
@customElement('atomic-spotlight-content-image')
@bindings()
@withTailwindStyles
export class AtomicSpotlightContentImage
  extends LitElement
  implements InitializableComponent<CommerceBindings>
{
  static styles: CSSResultGroup = css`
    @reference '../../../utils/tailwind.global.tw.css';

    :host {
      @apply block;
    }

    picture {
      @apply block;
    }

    [part='image'] {
      @apply block h-full w-full rounded-lg object-cover;
    }
  `;

  @state() public bindings!: CommerceBindings;
  @state() public error!: Error;
  @state() private spotlightContent?: SpotlightContent;

  private spotlightContentController = createSpotlightContentContextController(this);

  public initialize() {
    if (!this.spotlightContent && this.spotlightContentController.item) {
      this.spotlightContent = this.spotlightContentController.item;
    }
  }

  @bindingGuard()
  @errorGuard()
  render() {
    return html`${when(this.spotlightContent, () => {
      const {desktopImage, mobileImage, altText, name} = this.spotlightContent!;
      return html`<picture>
        ${when(
          mobileImage,
          () =>
            html`<source
              media="(width < ${this.bindings.store.state.mobileBreakpoint})"
              srcset=${filterProtocol(mobileImage!)}
            />`
        )}
        <img
          part="image"
          src=${filterProtocol(desktopImage)}
          alt=${altText ?? name ?? ''}
          loading="lazy"
        />
      </picture>`;
    })}`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-spotlight-content-image': AtomicSpotlightContentImage;
  }
}

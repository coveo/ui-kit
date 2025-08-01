import type {TemplateResult} from 'lit';
import {html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles.js';

/**
 *
 * @internal
 */
@customElement('atomic-facet-placeholder')
@withTailwindStyles
export class AtomicFacetPlaceholder extends LitElement {
  /**
   * The number of placeholder value items to display.
   */
  @property({type: Number, attribute: 'value-count'})
  public valueCount = 8;

  render(): TemplateResult {
    return html`
      <div
        part="placeholder"
        class="bg-background border-neutral mb-4 animate-pulse rounded-lg border p-7"
        aria-hidden="true"
      >
        <div
          part="title-skeleton"
          class="bg-neutral h-8 rounded"
          style="width: 75%;"
        ></div>
        <div part="values-container" class="mt-7">
          ${map(
            Array.from({length: this.valueCount}),
            () => html`
              <div
                part="value-skeleton"
                class="bg-neutral mt-4 flex h-5"
                style="width: 100%; opacity: 0.5;"
              ></div>
            `
          )}
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-facet-placeholder': AtomicFacetPlaceholder;
  }
}

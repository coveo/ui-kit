import type {TemplateResult} from 'lit';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {
  getItemDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
  type ItemDisplayLayout,
} from '@/src/components/common/layout/item-layout-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

const placeholderClasses = 'block bg-neutral w-full h-full rounded';

/**
 * The `atomic-result-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 * @internal
 */
@customElement('atomic-result-placeholder')
@withTailwindStyles
export class AtomicResultPlaceholder extends LitElement {
  static styles = css`
    @reference '../../common/template-system/template-system.pcss';

    :host {
      @apply atomic-template-system;

      .result-root {
        &.display-grid {
          atomic-result-section-actions {
            display: none;
          }
        }

        .badge {
          width: 14rem;
        }

        .action {
          width: 10rem;
        }

        .title {
          display: grid;
          grid-auto-flow: column;
          grid-gap: 0.5rem;
          height: var(--line-height);
          width: 30rem;
          max-width: 100%;
        }

        .fields-placeholder {
          display: grid;
          grid-template-columns: repeat(auto-fill, min(11rem, 40%));
          grid-column-gap: 0.5rem;

          .field-value-placeholder {
            height: var(--font-size);
            margin: calc((var(--line-height) - var(--font-size)) / 2) 0;
          }
        }
      }
    }
  `;

  /**
   * The display layout for the result placeholder.
   */
  @property({type: String}) display!: ItemDisplayLayout;

  /**
   * The display density for the result placeholder.
   */
  @property({type: String}) density!: ItemDisplayDensity;

  /**
   * The image size for the result placeholder.
   */
  @property({type: String, attribute: 'image-size'})
  imageSize!: ItemDisplayImageSize;

  private renderExcerptLine(width: string): TemplateResult {
    return html`
      <div
        style="height: var(--line-height); width: ${width};"
      >
        <div
          class=${placeholderClasses}
          style="height: var(--font-size);"
        ></div>
      </div>
    `;
  }

  render(): TemplateResult {
    const classes = [
      'result-root',
      'placeholder',
      'with-sections',
      'animate-pulse',
      ...getItemDisplayClasses(this.display, this.density, this.imageSize),
    ]
      .join(' ')
      .trim();

    return html`
      <div class=${classes}>
        <atomic-result-section-visual>
          <div class=${placeholderClasses}></div>
        </atomic-result-section-visual>
        <atomic-result-section-badges>
          <div class="badge ${placeholderClasses}"></div>
        </atomic-result-section-badges>
        <atomic-result-section-actions>
          <div class="action ${placeholderClasses}"></div>
        </atomic-result-section-actions>
        <atomic-result-section-title>
          <div class="title ${placeholderClasses}"></div>
        </atomic-result-section-title>
        <atomic-result-section-excerpt>
          ${this.renderExcerptLine('100%')} ${this.renderExcerptLine('95%')}
          ${this.renderExcerptLine('98%')}
        </atomic-result-section-excerpt>
        <atomic-result-section-bottom-metadata>
          <div class="fields-placeholder">
            ${Array.from(
              {length: 4},
              () => html`
              <div class="field-value-placeholder ${placeholderClasses}"></div>
            `
            )}
          </div>
        </atomic-result-section-bottom-metadata>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-placeholder': AtomicResultPlaceholder;
  }
}

import type {TemplateResult} from 'lit';
import {css, html, LitElement} from 'lit';
import {customElement, property} from 'lit/decorators.js';
import {map} from 'lit/directives/map.js';
import {
  getItemDisplayClasses,
  type ItemDisplayDensity,
  type ItemDisplayImageSize,
} from '@/src/components/common/layout/item-layout-utils';
import {withTailwindStyles} from '@/src/decorators/with-tailwind-styles';

/**
 * The `atomic-result-table-placeholder` component provides an intermediate visual state that is rendered before the first results are available.
 * @internal
 */
@customElement('atomic-result-table-placeholder')
@withTailwindStyles
export class AtomicResultTablePlaceholder extends LitElement {
  static styles = css`
  @reference '../../common/item-list/styles/mixins.pcss';
    :host {
    display: grid;
  }

  .list-root.display-table {
    @apply atomic-result-table border-neutral rounded-xl border;

    thead tr,
    tbody tr:not(:last-child) {
      position: relative;

      &::after {
        content: ' ';
        display: block;
        position: absolute;
        height: 1px;
        bottom: 0;
        left: var(--padding);
        right: var(--padding);
        @apply bg-neutral;
      }
    }

    th,
    td {
      border-color: transparent;
      border-radius: initial;
    }

    th {
      background-color: transparent;
    }
  }
  `;
  /**
   * The display density for the table.
   */
  @property({type: String}) density!: ItemDisplayDensity;

  /**
   * The image size for the table.
   */
  @property({type: String, attribute: 'image-size'})
  imageSize!: ItemDisplayImageSize;

  /**
   * The number of rows to display in the placeholder.
   */
  @property({type: Number}) rows!: number;

  private getClasses() {
    return getItemDisplayClasses('table', this.density, this.imageSize);
  }

  render(): TemplateResult {
    return html`
      <table
        class="list-root animate-pulse ${this.getClasses().join(' ')}"
      >
        <thead aria-hidden="true">
          <tr>
            <th>
              <div
                class="mt-2 h-8 block bg-neutral rounded"
                style="width: 14.5rem;"
              ></div>
            </th>
            <th>
              <div
                class="mt-2 h-8 block bg-neutral rounded"
                style="width: 9.75rem;"
              ></div>
            </th>
            <th>
              <div
                class="mt-2 h-8 block bg-neutral rounded"
                style="width: 6.5rem;"
              ></div>
            </th>
          </tr>
        </thead>
        <tbody>
          ${map(
            Array.from({length: this.rows}),
            () => html`
              <tr>
                <td>
                  <div
                    class="mb-6 h-8 block bg-neutral rounded"
                    style="width: 22.875rem;"
                  ></div>
                  <div
                    class="mb-2 h-5 block bg-neutral rounded"
                    style="width: 23.75rem;"
                  ></div>
                  <div
                    class="h-5 block bg-neutral rounded"
                    style="width: 11.5rem;"
                  ></div>
                </td>
                <td>
                  <div
                    class="mt-1.5 h-5 block bg-neutral rounded"
                    style="width: 11rem;"
                  ></div>
                </td>
                <td>
                  <div
                    class="mt-1.5 h-5 block bg-neutral rounded"
                    style="width: 4.875rem;"
                  ></div>
                </td>
              </tr>
            `
          )}
        </tbody>
      </table>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'atomic-result-table-placeholder': AtomicResultTablePlaceholder;
  }
}

import {customElement, property} from 'lit/decorators.js';
import {css, html, LitElement, nothing} from 'lit';
import {map} from 'lit/directives/map.js';
import {when} from 'lit/directives/when.js';
import {formatAttribute} from '@coveo/commerce-agent-chat-core/lib/commerceHelpers';
import type {Product} from '@coveo/commerce-agent-chat-core/types/commerce';
import './cac-price-display.js';

/**
 * The `cac-comparison-table` component renders product comparisons in table format.
 */
@customElement('cac-comparison-table')
export class CacComparisonTable extends LitElement {
  static override styles = css`
    .comparison-table-wrap {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .comparison-table-loading {
      border: 2px solid rgba(0, 212, 255, 0.2);
      border-radius: 10px;
      background: linear-gradient(
        135deg,
        rgba(22, 45, 66, 0.4) 0%,
        rgba(26, 58, 82, 0.3) 100%
      );
      padding: 0.85rem;
      display: grid;
      gap: 0.45rem;
      backdrop-filter: blur(5px);
    }

    .comparison-table-loading__line,
    .comparison-table-loading__cell {
      border-radius: 6px;
      background: linear-gradient(
        90deg,
        rgba(26, 77, 109, 0.3) 25%,
        rgba(0, 212, 255, 0.15) 50%,
        rgba(26, 77, 109, 0.3) 75%
      );
      background-size: 600px 100%;
      animation: shimmer 1.4s infinite linear;
    }

    .comparison-table-scroll {
      overflow-x: auto;
    }

    .comparison-table {
      border-collapse: collapse;
      width: 100%;
      font-size: 0.82rem;
    }

    .comparison-table th,
    .comparison-table td {
      padding: 0.55rem 0.8rem;
      border: 1px solid rgba(0, 212, 255, 0.2);
      text-align: left;
      vertical-align: middle;
      color: var(--ink);
    }

    .comparison-table thead th {
      background: rgba(26, 58, 82, 0.6);
      font-weight: 700;
      color: var(--accent);
      border-bottom: 2px solid rgba(0, 212, 255, 0.3);
    }

    .comparison-table__attr-col {
      min-width: 100px;
      background: rgba(26, 58, 82, 0.4);
      font-weight: 600;
    }

    .comparison-table__label {
      font-weight: 600;
      white-space: nowrap;
      background: rgba(26, 58, 82, 0.4);
    }

    .comparison-table__thumb {
      width: 48px;
      height: 48px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid rgba(0, 212, 255, 0.2);
      display: block;
    }

    .text-muted {
      color: var(--ink-muted);
    }
  `;

  /** The heading shown above the comparison table. */
  @property({type: String})
  public heading = '';

  /** The products shown in table columns. */
  @property({attribute: false})
  public products: Product[] = [];

  /** The dynamic attributes included after core rows. */
  @property({attribute: false})
  public comparisonAttributes: string[] = [];

  /** Whether loading placeholders should be rendered. */
  @property({type: Boolean, attribute: 'is-loading'})
  public isLoading = false;

  override render() {
    if (this.products.length === 0) {
      return this.renderEmptyState();
    }

    return html`
      <div class="comparison-table-wrap">
        <h3 class="commerce-heading">${this.heading}</h3>
        <div class="comparison-table-scroll">
          <table class="comparison-table">
            ${this.renderTableHead()}
            <tbody>
              ${this.renderImageRow()} ${this.renderBrandRow()}
              ${this.renderPriceRow()} ${this.renderAttributeRows()}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  private renderEmptyState() {
    return when(
      this.isLoading,
      () => html`
        <div class="comparison-table-wrap" aria-busy="true">
          <h3 class="commerce-heading">${this.heading}</h3>
          <div class="comparison-table-loading">
            <div class="comparison-table-loading__line"></div>
            <div
              class="comparison-table-loading__line comparison-table-loading__line--wide"
            ></div>
            <div class="comparison-table-loading__grid">
              <div class="comparison-table-loading__cell"></div>
              <div class="comparison-table-loading__cell"></div>
              <div class="comparison-table-loading__cell"></div>
            </div>
          </div>
        </div>
      `,
      () => nothing
    );
  }

  private renderTableHead() {
    return html`
      <thead>
        <tr>
          <th class="comparison-table__attr-col">Attribute</th>
          ${map(this.products, (product) => html`<th>${product.ec_name}</th>`)}
        </tr>
      </thead>
    `;
  }

  private renderImageRow() {
    return html`
      <tr>
        <td class="comparison-table__label">Image</td>
        ${map(this.products, (product) => this.renderImageCell(product))}
      </tr>
    `;
  }

  private renderImageCell(product: Product) {
    return html`
      <td>
        ${when(
          Boolean(product.ec_image),
          () => html`
            <img
              src=${product.ec_image}
              alt=${product.ec_name}
              class="comparison-table__thumb"
            />
          `,
          () => html`<span class="text-muted">No image</span>`
        )}
      </td>
    `;
  }

  private renderBrandRow() {
    return html`
      <tr>
        <td class="comparison-table__label">Brand</td>
        ${map(this.products, (product) => html`<td>${product.ec_brand}</td>`)}
      </tr>
    `;
  }

  private renderPriceRow() {
    return html`
      <tr>
        <td class="comparison-table__label">Price</td>
        ${map(
          this.products,
          (product) => html`
            <td>
              <cac-price-display .product=${product}></cac-price-display>
            </td>
          `
        )}
      </tr>
    `;
  }

  private renderAttributeRows() {
    return map(this.comparisonAttributes, (attribute) =>
      this.renderAttributeRow(attribute)
    );
  }

  private renderAttributeRow(attribute: string) {
    return html`
      <tr>
        <td class="comparison-table__label">${formatAttribute(attribute)}</td>
        ${map(this.products, (product) =>
          this.renderAttributeCell(product, attribute)
        )}
      </tr>
    `;
  }

  private renderAttributeCell(product: Product, attribute: string) {
    const value = product[attribute];

    return html`
      <td>
        ${when(
          value != null,
          () => String(value),
          () => html`<span class="text-muted">—</span>`
        )}
      </td>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'cac-comparison-table': CacComparisonTable;
  }
}

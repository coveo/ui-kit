import {CommonModule} from '@angular/common';
import {Component, Input} from '@angular/core';

import type {Product} from '@core/types/commerce.js';

import {CommercePriceDisplayComponent} from './commerce-price-display.component';

interface BundleSlotWithProduct {
  categoryLabel: string;
  surfaceRef: string;
  product: Product | null;
}

export interface BundleTierWithProducts {
  bundleId: string;
  label: string;
  description?: string;
  slots: BundleSlotWithProduct[];
}

@Component({
  selector: 'app-commerce-bundle-display',
  standalone: true,
  imports: [CommonModule, CommercePriceDisplayComponent],
  template: `
    @if (bundles.length === 0 && isLoading) {
      <div class="bundle-display" aria-busy="true">
        <h3 class="commerce-heading">{{ title }}</h3>
        <div class="bundle-slots">
          @for (item of [1, 2, 3]; track item) {
            <div class="bundle-slot" aria-hidden="true">
              <div class="commerce-loading commerce-loading--line"></div>
              <div class="commerce-loading commerce-loading--image"></div>
              <div
                class="commerce-loading commerce-loading--line commerce-loading--line-wide"
              ></div>
            </div>
          }
        </div>
      </div>
    } @else if (bundles.length > 0) {
      <div class="bundle-display">
        <h3 class="commerce-heading">{{ title }}</h3>
        @if (bundles.length > 1) {
          <div class="bundle-tabs" role="tablist" aria-label="Bundle tiers">
            @for (bundle of bundles; track bundle.bundleId) {
              <button
                type="button"
                role="tab"
                [attr.aria-selected]="$index === activeIndex"
                class="bundle-tab"
                [class.bundle-tab--active]="$index === activeIndex"
                (click)="activeIndex = $index"
              >
                {{ bundle.label }}
              </button>
            }
          </div>
        }

        @if (bundles[activeIndex]; as activeBundle) {
          <div role="tabpanel">
            @if (activeBundle.description) {
              <p class="bundle-description">{{ activeBundle.description }}</p>
            }
            <div class="bundle-slots">
              @for (
                slot of activeBundle.slots;
                track slot.surfaceRef + '-' + $index
              ) {
                <div class="bundle-slot">
                  <p class="bundle-slot__label">{{ slot.categoryLabel }}</p>
                  @if (slot.product) {
                    @if (slot.product.ec_image) {
                      <img
                        [src]="slot.product.ec_image"
                        [alt]="slot.product.ec_name"
                        class="bundle-slot__image"
                      />
                    }
                    <p class="bundle-slot__name">{{ slot.product.ec_name }}</p>
                    <p class="bundle-slot__brand">
                      {{ slot.product.ec_brand }}
                    </p>
                    <app-commerce-price-display [product]="slot.product" />
                  } @else {
                    <p class="text-muted">Product not available</p>
                  }
                </div>
              }
            </div>
          </div>
        }
      </div>
    }
  `,
  styles: [
    `
      .bundle-display {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
      }

      .bundle-tabs {
        display: flex;
        gap: 0.4rem;
        flex-wrap: wrap;
      }

      .bundle-tab {
        padding: 0.4rem 0.9rem;
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 10px;
        background: rgba(22, 45, 66, 0.5);
        color: var(--ink);
        font: inherit;
        font-size: 0.84rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.3s ease;
      }

      .bundle-tab--active {
        background: linear-gradient(
          135deg,
          var(--accent-warm) 0%,
          var(--accent) 100%
        );
        color: #000;
        border-color: var(--accent);
        box-shadow: 0 0 20px rgba(0, 212, 255, 0.4);
      }

      .bundle-tab:hover {
        border-color: var(--accent);
        box-shadow: 0 0 15px rgba(0, 212, 255, 0.2);
      }

      .bundle-description {
        margin: 0 0 0.5rem;
        font-size: 0.82rem;
        color: var(--ink-muted);
      }

      .bundle-slots {
        display: flex;
        gap: 0.65rem;
        overflow-x: auto;
        padding-bottom: 0.25rem;
      }

      .bundle-slot {
        flex: 0 0 160px;
        border: 2px solid rgba(0, 212, 255, 0.3);
        border-radius: 12px;
        background: linear-gradient(
          135deg,
          rgba(22, 45, 66, 0.5) 0%,
          rgba(26, 58, 82, 0.3) 100%
        );
        padding: 0.7rem;
        display: flex;
        flex-direction: column;
        gap: 0.35rem;
        transition: all 0.3s ease;
        box-shadow: 0 0 12px rgba(0, 212, 255, 0.1);
        backdrop-filter: blur(5px);
      }

      .bundle-slot:hover {
        border-color: rgba(0, 212, 255, 0.6);
        box-shadow: 0 0 25px rgba(0, 212, 255, 0.2);
        transform: translateY(-2px);
      }

      .bundle-slot__label {
        margin: 0;
        font-size: 0.78rem;
        font-weight: 600;
        color: var(--ink);
      }

      .bundle-slot__image {
        width: 100%;
        height: 90px;
        object-fit: cover;
        border-radius: 6px;
        display: block;
      }

      .bundle-slot__name {
        margin: 0;
        font-size: 0.8rem;
        font-weight: 500;
        color: var(--ink);
      }

      .bundle-slot__brand {
        margin: 0;
        font-size: 0.75rem;
        color: var(--ink-muted);
      }

      .text-muted {
        color: var(--ink-muted);
      }
    `,
  ],
})
export class CommerceBundleDisplayComponent {
  @Input() title = '';
  @Input() bundles: BundleTierWithProducts[] = [];
  @Input() isLoading = false;

  protected activeIndex = 0;
}

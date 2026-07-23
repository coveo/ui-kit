import {ChangeDetectionStrategy, Component, input, signal, computed} from '@angular/core';
import {BundleDisplaySurface} from '../models';

@Component({
  selector: 'app-bundle-display',
  template: `
    <section class="surface">
      <header class="surface-header">
        <p class="surface-kicker">Bundle Display</p>
        <h3>{{ surface().title }}</h3>
      </header>

      @if (surface().isLoading || surface().bundles.length === 0) {
        <div class="loading-grid">
          @for (item of placeholders; track $index) {
            <div class="loading-card"></div>
          }
        </div>
      } @else {
        <nav class="tier-tabs" aria-label="Bundle tiers">
          @for (bundle of surface().bundles; track bundle.bundleId) {
            <button
              class="tier-tab"
              [class.active]="isActive(bundle.bundleId)"
              (click)="selectTier(bundle.bundleId)"
              type="button"
              [attr.aria-pressed]="isActive(bundle.bundleId)"
            >
              {{ bundle.label }}
            </button>
          }
        </nav>

        @if (activeTier(); as tier) {
          <p class="tier-description">{{ tier.description }}</p>

          <div class="slot-carousel">
            @for (slot of tier.slots; track slot.surfaceRef + ':' + slot.categoryLabel) {
              <div class="slot-card">
                <span class="slot-label">{{ slot.categoryLabel }}</span>
                @if (slot.product) {
                  @if (slot.product.ec_image) {
                    <img
                      class="slot-image"
                      [src]="slot.product.ec_image"
                      [alt]="slot.product.ec_name"
                      loading="lazy"
                    />
                  }
                  <strong class="slot-name">{{ slot.product.ec_name }}</strong>
                  <small class="slot-brand">{{ slot.product.ec_brand }}</small>
                  @if (slot.product.ec_price) {
                    <span class="slot-price">{{ formatPrice(slot.product.ec_price) }}</span>
                  }
                } @else {
                  <div class="slot-empty">Loading…</div>
                }
              </div>
            }
          </div>
        }
      }
    </section>
  `,
  styles: [
    `
      .surface-header {
        margin-bottom: 16px;
      }

      .surface-kicker {
        margin: 0 0 6px;
        text-transform: uppercase;
        letter-spacing: 0.1em;
        font-size: 0.74rem;
        color: #516661;
      }

      h3 {
        margin: 0;
      }

      .loading-grid {
        display: grid;
        gap: 14px;
      }

      .loading-card {
        min-height: 180px;
        border-radius: 22px;
        background: linear-gradient(
          90deg,
          rgba(231, 221, 209, 0.95),
          rgba(247, 241, 232, 0.95),
          rgba(231, 221, 209, 0.95)
        );
        background-size: 200% 100%;
        animation: shimmer 1.25s linear infinite;
      }

      .tier-tabs {
        display: flex;
        gap: 8px;
        margin-bottom: 16px;
        overflow-x: auto;
      }

      .tier-tab {
        appearance: none;
        border: 1px solid rgba(17, 35, 31, 0.12);
        border-radius: 999px;
        padding: 8px 16px;
        background: rgba(255, 255, 255, 0.8);
        color: #204f46;
        cursor: pointer;
        font: inherit;
        font-size: 0.9rem;
        white-space: nowrap;
        transition:
          background 150ms ease,
          border-color 150ms ease;
      }

      .tier-tab:hover {
        background: rgba(215, 239, 231, 0.6);
      }

      .tier-tab.active {
        background: #204f46;
        color: white;
        border-color: #204f46;
      }

      .tier-description {
        margin: 0 0 16px;
        color: #516661;
        line-height: 1.5;
        font-size: 0.95rem;
      }

      .slot-carousel {
        display: flex;
        gap: 14px;
        overflow-x: auto;
        scroll-snap-type: x mandatory;
        padding-bottom: 8px;
      }

      .slot-card {
        flex: 0 0 200px;
        scroll-snap-align: start;
        padding: 14px;
        border-radius: 18px;
        background: rgba(246, 242, 232, 0.9);
        border: 1px solid rgba(17, 35, 31, 0.08);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }

      .slot-label {
        text-transform: uppercase;
        letter-spacing: 0.08em;
        font-size: 0.7rem;
        color: #516661;
      }

      .slot-image {
        width: 100%;
        height: 120px;
        object-fit: cover;
        border-radius: 12px;
        background: #f0ece4;
      }

      .slot-name {
        font-size: 0.9rem;
      }

      .slot-brand {
        color: #516661;
        font-size: 0.82rem;
      }

      .slot-price {
        font-weight: 600;
        color: #204f46;
        font-size: 0.9rem;
      }

      .slot-empty {
        height: 120px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        background: rgba(231, 221, 209, 0.6);
        color: #516661;
        font-size: 0.85rem;
      }

      @keyframes shimmer {
        0% {
          background-position: 200% 0;
        }
        100% {
          background-position: -200% 0;
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BundleDisplayComponent {
  protected readonly placeholders = Array.from({length: 1});
  readonly surface = input.required<BundleDisplaySurface>();

  protected readonly activeTierId = signal('');

  protected readonly activeTier = computed(() => {
    const bundles = this.surface().bundles;
    if (bundles.length === 0) return null;

    const id = this.activeTierId();
    const found = bundles.find((b) => b.bundleId === id);
    return found ?? bundles[0];
  });

  protected isActive(bundleId: string): boolean {
    const tier = this.activeTier();
    return tier?.bundleId === bundleId;
  }

  protected selectTier(bundleId: string): void {
    this.activeTierId.set(bundleId);
  }

  protected formatPrice(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  }
}

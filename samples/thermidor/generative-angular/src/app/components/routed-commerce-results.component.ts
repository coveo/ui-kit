import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  effect,
  inject,
  input,
  signal,
} from '@angular/core';
import {
  buildProductListController,
  buildPaginationController,
  type ProductListControllerState,
  type PaginationControllerState,
  type PaginationController,
  type CommerceInterface,
} from '@coveo/thermidor';
import {ProductCardComponent, type ProductCardData} from './product-card.component';
import {PaginationComponent} from './pagination.component';

@Component({
  selector: 'app-routed-commerce-results',
  imports: [ProductCardComponent, PaginationComponent],
  template: `
    @if (products().length === 0 && !isLoading()) {
      <p class="empty">No products found.</p>
    } @else {
      <div class="grid">
        @for (card of cards(); track card.id) {
          <app-product-card [product]="card" />
        }
      </div>
    }

    @if (paginationState(); as pagination) {
      <app-pagination
        [page]="pagination.page"
        [totalPages]="pagination.totalPages"
        [pageSize]="pagination.pageSize"
        (previous)="selectPage(pagination.page - 1)"
        (next)="selectPage(pagination.page + 1)"
        (pageSizeChange)="setPageSize($event)"
      />
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
        gap: 14px;
      }

      .empty {
        color: #516661;
        font-size: 0.95rem;
        text-align: center;
        padding: 24px 0;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RoutedCommerceResultsComponent {
  private readonly destroyRef = inject(DestroyRef);

  readonly commerceInterface = input.required<CommerceInterface>();

  protected readonly products = signal<ProductListControllerState['products']>([]);
  protected readonly paginationState = signal<PaginationControllerState | null>(null);
  protected readonly isLoading = signal(true);

  private paginationController: PaginationController | null = null;

  protected readonly cards = computed<ProductCardData[]>(() =>
    this.products().map((p) => ({
      id: p.permanentid,
      name: p.ec_name,
      brand: p.ec_brand,
      image: p.ec_thumbnails?.[0] ?? p.ec_images?.[0],
      price: p.ec_price,
      promoPrice: p.ec_promo_price,
      description: p.ec_shortdesc ?? p.ec_description,
    }))
  );

  constructor() {
    let cleanup: (() => void) | null = null;

    effect(() => {
      const iface = this.commerceInterface();

      if (cleanup) {
        cleanup();
      }

      const productList = buildProductListController({interface: iface});
      const pagination = buildPaginationController({interface: iface});

      this.paginationController = pagination;

      this.products.set(productList.state.products);
      this.paginationState.set(pagination.state);
      this.isLoading.set(productList.state.products.length === 0);

      const unsubProducts = productList.subscribe(() => {
        this.products.set(productList.state.products);
        this.isLoading.set(false);
      });

      const unsubPagination = pagination.subscribe(() => {
        this.paginationState.set(pagination.state);
      });

      cleanup = () => {
        unsubProducts();
        unsubPagination();
        iface.dispose();
      };
    });

    this.destroyRef.onDestroy(() => {
      cleanup?.();
    });
  }

  protected selectPage(page: number): void {
    this.paginationController?.selectPage(page);
  }

  protected setPageSize(size: number): void {
    this.paginationController?.setPageSize(size);
  }
}

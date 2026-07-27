import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

const PAGE_SIZE_OPTIONS = [5, 10, 20, 50];

@Component({
  selector: 'app-pagination',
  template: `
    <div class="container">
      <button
        class="nav-button"
        (click)="previous.emit()"
        [disabled]="page() === 0"
        aria-label="Previous page"
      >
        &larr; Previous
      </button>
      <span class="indicator"> Page {{ page() + 1 }} of {{ totalPages() }} </span>
      <button
        class="nav-button"
        (click)="next.emit()"
        [disabled]="totalPages() <= 1 || page() === totalPages() - 1"
        aria-label="Next page"
      >
        Next &rarr;
      </button>
      <select
        class="page-size-select"
        [value]="pageSize()"
        (change)="onPageSizeChange($event)"
        aria-label="Results per page"
      >
        @for (size of pageSizeOptions; track size) {
          <option [value]="size" [selected]="size === pageSize()">{{ size }} per page</option>
        }
      </select>
    </div>
  `,
  styles: [
    `
      .container {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 12px 0;
        flex-wrap: wrap;
      }

      .nav-button {
        appearance: none;
        border: 1px solid rgba(17, 35, 31, 0.12);
        border-radius: 8px;
        padding: 8px 14px;
        background: rgba(255, 255, 255, 0.8);
        color: #204f46;
        cursor: pointer;
        font: inherit;
        font-size: 0.88rem;
        transition:
          background 150ms ease,
          opacity 150ms ease;
      }

      .nav-button:hover:not(:disabled) {
        background: rgba(215, 239, 231, 0.6);
      }

      .nav-button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      .indicator {
        font-size: 0.88rem;
        color: #516661;
      }

      .page-size-select {
        margin-left: auto;
        appearance: none;
        border: 1px solid rgba(17, 35, 31, 0.12);
        border-radius: 8px;
        padding: 8px 12px;
        background: rgba(255, 255, 255, 0.8);
        color: #204f46;
        font: inherit;
        font-size: 0.85rem;
        cursor: pointer;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly totalPages = input.required<number>();
  readonly pageSize = input.required<number>();

  readonly previous = output<void>();
  readonly next = output<void>();
  readonly pageSizeChange = output<number>();

  protected readonly pageSizeOptions = PAGE_SIZE_OPTIONS;

  protected onPageSizeChange(event: Event): void {
    const value = Number((event.target as HTMLSelectElement).value);
    this.pageSizeChange.emit(value);
  }
}

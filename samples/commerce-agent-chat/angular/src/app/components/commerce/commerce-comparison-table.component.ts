import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Input} from '@angular/core';
import type {Product} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-comparison-table',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-comparison-table
      [heading]="heading"
      [products]="products"
      [comparisonAttributes]="attributes"
      [isLoading]="isLoading"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceComparisonTableComponent {
  @Input() heading = '';
  @Input() products: Product[] = [];
  @Input() attributes: string[] = [];
  @Input() isLoading = false;
}

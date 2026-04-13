import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Input} from '@angular/core';
import type {Product} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-price-display',
  standalone: true,
  imports: [CommonModule],
  template: ` <cac-price-display [product]="product" /> `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommercePriceDisplayComponent {
  @Input({required: true}) product!: Product;
}

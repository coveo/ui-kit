import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Input} from '@angular/core';

import type {Product} from '@core/types/commerce.js';

export interface ProductSection {
  heading: string;
  products: Product[];
}

@Component({
  selector: 'app-commerce-product-carousel',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-product-carousel [sections]="sections" [isLoading]="isLoading" />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceProductCarouselComponent {
  @Input() sections: ProductSection[] = [];
  @Input() isLoading = false;
}

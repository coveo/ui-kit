import {CommonModule} from '@angular/common';
import {CUSTOM_ELEMENTS_SCHEMA, Component, Input} from '@angular/core';

import type {Product} from '@core/types/commerce.js';

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
  imports: [CommonModule],
  template: `
    <cac-bundle-display
      [heading]="title"
      [bundles]="bundles"
      [isLoading]="isLoading"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceBundleDisplayComponent {
  @Input() title = '';
  @Input() bundles: BundleTierWithProducts[] = [];
  @Input() isLoading = false;
}

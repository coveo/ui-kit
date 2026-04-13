import {CommonModule} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type {A2UISurfaceContent} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-catalog-view',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-commerce-catalog-view
      [content]="content"
      [isLoading]="isLoading"
      (commerce-action-click)="onActionClick($event)"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceCatalogViewComponent {
  @Input({required: true}) content!: A2UISurfaceContent;
  @Input() isLoading = false;
  @Output() actionSelected = new EventEmitter<string>();

  onActionClick(event: Event): void {
    const customEvent = event as CustomEvent<{prompt: string}>;
    this.actionSelected.emit(customEvent.detail.prompt);
  }
}

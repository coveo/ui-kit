import {CommonModule} from '@angular/common';
import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type {NextAction} from '@core/types/commerce.js';

@Component({
  selector: 'app-commerce-next-actions-bar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-next-actions-bar
      [actions]="actions"
      [isLoading]="isLoading"
      (commerce-action-click)="onActionClick($event)"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class CommerceNextActionsBarComponent {
  @Input() actions: NextAction[] = [];
  @Input() isLoading = false;
  @Output() actionClick = new EventEmitter<string>();

  protected onActionClick(event: Event) {
    const customEvent = event as CustomEvent<{prompt: string}>;
    this.actionClick.emit(customEvent.detail.prompt);
  }
}

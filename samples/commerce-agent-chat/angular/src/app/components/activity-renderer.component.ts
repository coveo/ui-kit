import {CommonModule} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type {ActivityMessage} from '@core/types/agent.js';

@Component({
  selector: 'app-activity-renderer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-activity-renderer
      [activity]="activity"
      [isLoading]="isLoading"
      (commerce-action-click)="onActionClick($event)"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class ActivityRendererComponent {
  @Input({required: true}) activity!: ActivityMessage;
  @Input() isLoading = false;
  @Output() actionSelected = new EventEmitter<string>();

  onActionClick(event: Event): void {
    const customEvent = event as CustomEvent<{prompt: string}>;
    this.actionSelected.emit(customEvent.detail.prompt);
  }
}

import {CommonModule} from '@angular/common';
import {
  Component,
  CUSTOM_ELEMENTS_SCHEMA,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

import type {Message, ProgressTraceEntry} from '@core/types/agent.js';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <cac-message-list
      [messages]="messages"
      [isLoading]="isLoading"
      [progressSteps]="progressSteps"
      [progressTrace]="progressTrace"
      (commerce-action-click)="onActionClick($event)"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
  @Input() isLoading = false;
  @Input() progressSteps: string[] = [];
  @Input() progressTrace: ProgressTraceEntry[] = [];
  @Output() actionSelected = new EventEmitter<string>();

  onActionClick(event: Event): void {
    const customEvent = event as CustomEvent<{prompt: string}>;
    this.actionSelected.emit(customEvent.detail.prompt);
  }
}

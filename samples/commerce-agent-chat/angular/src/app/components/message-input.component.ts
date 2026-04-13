import {
  CUSTOM_ELEMENTS_SCHEMA,
  Component,
  EventEmitter,
  Input,
  Output,
} from '@angular/core';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [],
  template: `
    <cac-message-input
      [disabled]="disabled"
      (message-send)="onMessageSend($event)"
    />
  `,
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class MessageInputComponent {
  @Input() disabled = false;
  @Output() send = new EventEmitter<string>();

  onMessageSend(event: Event): void {
    const customEvent = event as CustomEvent<{content: string}>;
    this.send.emit(customEvent.detail.content);
  }
}

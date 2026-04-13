import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormsModule} from '@angular/forms';

@Component({
  selector: 'app-message-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <form
      class="message-form"
      (ngSubmit)="onSubmit()"
      aria-label="Send message"
    >
      <label for="chat-input" class="visually-hidden">Type your message</label>
      <p id="chat-input-hint" class="visually-hidden">
        Press Enter to send. Press Shift plus Enter to insert a new line.
      </p>
      <textarea
        id="chat-input"
        name="chatInput"
        class="message-input"
        [disabled]="disabled"
        [(ngModel)]="value"
        placeholder="Ask Zane..."
        rows="2"
        aria-describedby="chat-input-hint"
        (keydown)="onKeyDown($event)"
      ></textarea>
      <button
        type="submit"
        class="send-button"
        [disabled]="disabled || value.trim().length === 0"
      >
        Send
      </button>
    </form>
  `,
})
export class MessageInputComponent {
  @Input() disabled = false;
  @Output() send = new EventEmitter<string>();

  value = '';

  onKeyDown(event: KeyboardEvent): void {
    if (event.key !== 'Enter' || event.shiftKey) {
      return;
    }

    event.preventDefault();
    this.onSubmit();
  }

  onSubmit(): void {
    const content = this.value.trim();
    if (!content || this.disabled) {
      return;
    }

    this.send.emit(content);
    this.value = '';
  }
}

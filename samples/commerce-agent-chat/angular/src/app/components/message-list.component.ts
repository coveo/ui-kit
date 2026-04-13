import {CommonModule} from '@angular/common';
import {Component, EventEmitter, Input, Output} from '@angular/core';
import {DomSanitizer, SafeHtml} from '@angular/platform-browser';
import {marked} from 'marked';

import type {Message} from '@core/types/agent.js';

import {ActivityRendererComponent} from './activity-renderer.component';

@Component({
  selector: 'app-message-list',
  standalone: true,
  imports: [CommonModule, ActivityRendererComponent],
  template: `
    <section
      class="message-list"
      aria-live="polite"
      aria-label="Conversation messages"
    >
      @if (messages.length === 0) {
        <p class="empty-state">🏄 Start a conversation with Zane 🤙</p>
      }

      @for (message of messages; track message.id) {
        <article
          class="message"
          [class.message-user]="message.role === 'user'"
          [class.message-assistant]="message.role === 'assistant'"
        >
          <p class="message-role">
            {{ message.role === 'user' ? 'You' : 'Zane (Agent)' }}
          </p>
          @if (message.role === 'user') {
            <p class="message-content message-content--plain">
              {{
                message.content ||
                  (isLoading && isLatestAssistant(message.id) ? '' : '...')
              }}
            </p>
          } @else if (message.content) {
            <div
              class="message-content message-content--markdown"
              [innerHTML]="renderMarkdown(message.content)"
            ></div>
          }

          @if (
            isLoading &&
            isLatestAssistant(message.id) &&
            progressSteps.length > 0
          ) {
            <ul class="agent-progress__steps">
              @for (step of progressSteps; track $index) {
                <li
                  class="agent-progress__step"
                  [class.agent-progress__step--active]="
                    $index === progressSteps.length - 1
                  "
                >
                  {{ step }}
                </li>
              }
            </ul>
          }
        </article>

        @for (activity of message.activities ?? []; track activity.id) {
          <app-activity-renderer
            [activity]="activity"
            [isLoading]="isLoading && isLatestAssistant(message.id)"
            (actionSelected)="actionSelected.emit($event)"
          />
        }
      }
    </section>
  `,
})
export class MessageListComponent {
  @Input() messages: Message[] = [];
  @Input() isLoading = false;
  @Input() progressSteps: string[] = [];
  @Output() actionSelected = new EventEmitter<string>();

  constructor(private sanitizer: DomSanitizer) {}

  isLatestAssistant(id: string): boolean {
    const reversed = [...this.messages].reverse();
    const latestAssistant = reversed.find(
      (message) => message.role === 'assistant'
    );
    return latestAssistant?.id === id;
  }

  renderMarkdown(content: string): SafeHtml {
    const html = marked(content, {async: false}) as string;
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }
}

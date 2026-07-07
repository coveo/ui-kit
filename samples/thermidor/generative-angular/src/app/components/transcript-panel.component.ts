import {
  ChangeDetectionStrategy,
  Component,
  computed,
  input,
  output,
  Pipe,
  PipeTransform,
} from '@angular/core';
import {marked} from 'marked';
import type {RenderableCommerceSurface, ToolCall, Turn} from '../models';
import {SurfaceOutletComponent} from './surface-outlet.component';

marked.setOptions({breaks: true, gfm: true});

@Pipe({name: 'markdown', standalone: true})
export class MarkdownPipe implements PipeTransform {
  transform(value: string): string {
    if (!value) return '';
    return marked.parse(value) as string;
  }
}

@Component({
  selector: 'app-transcript-panel',
  imports: [SurfaceOutletComponent, MarkdownPipe],
  template: `
    <header class="panel-header">
      <div>
        <p class="panel-kicker">Conversation</p>
        <h2>Conversation with inline surfaces</h2>
      </div>
      <button
        class="ghost-button"
        type="button"
        (click)="resetConversation.emit()"
      >
        Reset
      </button>
    </header>

    <div class="transcript">
      @if (turns().length === 0 && !isStreaming()) {
        <div class="empty-state">
          <p>No messages yet.</p>
          <span
            >Try "show me surfboards", "compare kayaks", or "build a surfing
            bundle".</span
          >
        </div>
      }

      @for (turn of turns(); track turn.id) {
        <article class="bubble user-bubble">
          <p class="bubble-role">You</p>
          <p class="bubble-text">{{ turn.prompt }}</p>
        </article>

        @for (msg of turn.agentResponse?.messages ?? []; track $index) {
          <article class="bubble assistant-bubble">
            <p class="bubble-role">Assistant</p>
            <div
              class="bubble-text markdown-content"
              [innerHTML]="msg.content | markdown"
            ></div>
          </article>
        }
      }

      @if (isStreaming()) {
        <div class="streaming-indicator" aria-live="polite">
          <span class="streaming-dot"></span>
          <span class="streaming-dot"></span>
          <span class="streaming-dot"></span>
        </div>
      }

      @if (errorMessage()) {
        <div class="error-block" role="alert">
          <p class="error-message">{{ errorMessage() }}</p>
          <button
            class="ghost-button"
            type="button"
            (click)="retryTurn.emit(turnId())"
          >
            Retry
          </button>
        </div>
      }

      @if (hasProgress()) {
        <details class="progress-block">
          <summary>
            <span>Progress</span>
            <small>{{ progressLabel() }}</small>
          </summary>

          <div class="progress-content">
            @if (reasoningText()) {
              <p class="progress-reasoning">{{ reasoningText() }}</p>
            }

            @if (toolActivity().length > 0) {
              <ul class="progress-list">
                @for (tool of toolActivity(); track tool.id) {
                  <li>
                    <span>{{ truncateToolName(tool.name) }}</span>
                    <small>{{
                      tool.status === 'completed' ? 'Done' : 'Running'
                    }}</small>
                  </li>
                }
              </ul>
            }
          </div>
        </details>
      }

      @if (surfaces().length > 0) {
        <article class="inline-surfaces">
          <div class="inline-surfaces-head">
            <p class="bubble-role">Assistant</p>
            <span>Structured results</span>
          </div>

          <div class="surface-stack">
            @for (surface of surfaces(); track surface.surfaceId) {
              <app-surface-outlet
                [surface]="surface"
                (quickAction)="quickAction.emit($event)"
              />
            }
          </div>
        </article>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TranscriptPanelComponent {
  readonly turns = input<Turn[]>([]);
  readonly reasoningText = input('');
  readonly toolActivity = input<ToolCall[]>([]);
  readonly surfaces = input<RenderableCommerceSurface[]>([]);
  readonly isStreaming = input(false);
  readonly errorMessage = input('');
  readonly turnId = input('');
  readonly resetConversation = output<void>();
  readonly quickAction = output<string>();
  readonly retryTurn = output<string>();

  protected readonly hasProgress = computed(
    () => this.toolActivity().length > 0 || this.reasoningText().length > 0
  );

  protected readonly progressLabel = computed(() => {
    const activity = this.toolActivity();
    return activity.length > 0
      ? activity[activity.length - 1].status === 'calling'
        ? 'Working'
        : 'Completed'
      : 'Thinking';
  });

  protected truncateToolName(name: string): string {
    return name.length > 60 ? name.slice(0, 57) + '...' : name;
  }
}

import {ChangeDetectionStrategy, Component, input, output} from '@angular/core';

@Component({
  selector: 'app-prompt-composer',
  template: `
    <form class="composer" (submit)="handleSubmit($event)">
      <label class="composer-label" for="prompt"
        >Ask the storefront assistant</label
      >
      <textarea
        #draftInput
        id="prompt"
        rows="3"
        [value]="draft()"
        [disabled]="busy()"
        placeholder="Show me surfboards"
        (input)="draftChange.emit(draftInput.value)"
      ></textarea>

      <div class="composer-actions">
        <span class="status-pill" [class.active]="busy()">{{ status() }}</span>
        <button
          class="primary-button"
          type="submit"
          [disabled]="busy() || !draft().trim()"
        >
          {{ busy() ? 'Streaming…' : 'Send' }}
        </button>
      </div>
    </form>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PromptComposerComponent {
  readonly draft = input('');
  readonly busy = input(false);
  readonly status = input('Ready');
  readonly draftChange = output<string>();
  readonly submitPrompt = output<void>();

  protected handleSubmit(event: Event): void {
    event.preventDefault();

    if (this.busy() || !this.draft().trim()) {
      return;
    }

    this.submitPrompt.emit();
  }
}

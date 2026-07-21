import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import {ConversationHeaderComponent} from './components/conversation-header.component';
import {PromptComposerComponent} from './components/prompt-composer.component';
import {TranscriptPanelComponent} from './components/transcript-panel.component';
import {ConversationService} from './services/conversation.service';

@Component({
  selector: 'app-root',
  imports: [
    ConversationHeaderComponent,
    TranscriptPanelComponent,
    PromptComposerComponent,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  protected readonly conversation = inject(ConversationService);
  protected readonly draft = signal('');

  protected submitPrompt(): void {
    const prompt = this.draft().trim();
    if (!prompt) return;
    this.conversation.submit(prompt);
    this.draft.set('');
  }

  protected setDraft(value: string): void {
    this.draft.set(value);
  }

  protected useQuickAction(prompt: string): void {
    this.conversation.submit(prompt);
  }
}

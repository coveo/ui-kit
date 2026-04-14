import {Injectable, inject, signal} from '@angular/core';

import {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import {toChatState} from '@core/lib/chatStore.js';
import type {ChatState} from '@core/types/agent.js';

import {ConfigService} from './services/config.service';

@Injectable({providedIn: 'root'})
export class ChatService {
  private readonly configService = inject(ConfigService);
  private readonly orchestrator = new ChatSessionOrchestrator(
    this.configService.getConfig()
  );
  private readonly store = this.orchestrator.getStore();
  readonly state = signal<ChatState>(toChatState(this.store.getState()));

  constructor() {
    this.store.subscribe((sessionState) => {
      this.state.set(toChatState(sessionState));
    });
  }

  sendMessage(content: string): void {
    this.orchestrator.sendMessage(content);
  }

  clearMessages(): void {
    this.orchestrator.clearMessages();
  }

  dismissError(): void {
    this.orchestrator.dismissError();
  }
}

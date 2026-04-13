import {Injectable, inject, signal} from '@angular/core';

import {ChatSessionOrchestrator} from '@core/lib/chatSessionOrchestrator.js';
import type {ChatState} from '@core/types/agent.js';

import {ConfigService} from './services/config.service';

@Injectable({providedIn: 'root'})
export class ChatService {
  private readonly configService = inject(ConfigService);
  private readonly orchestrator = new ChatSessionOrchestrator(
    this.configService.getConfig()
  );
  readonly state = signal<ChatState>(this.orchestrator.getState());

  constructor() {
    this.orchestrator.subscribe((update) => {
      this.state.set(update.state);
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

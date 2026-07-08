import {Injectable, inject, signal} from '@angular/core';
import {
  buildGenerativeInterface,
  buildConverseController,
  type ConverseController,
  type ConverseControllerState,
  type SerializedConverseState,
} from '@coveo/thermidor';
import {EngineService} from './engine.service';
import {A2uiAdapterService} from './a2ui-adapter.service';
import {CONVERSATION_STORAGE_KEY} from '../constants';
import type {A2UISurface, ToolCall, Turn} from '../models';

@Injectable({providedIn: 'root'})
export class ConversationService {
  private readonly engineService = inject(EngineService);
  private readonly adapter = inject(A2uiAdapterService);
  private readonly controller: ConverseController;

  readonly busy = signal(false);
  readonly turns = signal<Turn[]>([]);
  readonly reasoningText = signal('');
  readonly toolActivity = signal<ToolCall[]>([]);
  readonly activeTurnError = signal('');

  constructor() {
    const generativeInterface = buildGenerativeInterface({
      engine: this.engineService.engine,
    });

    this.controller = buildConverseController({
      interface: generativeInterface,
      initialState: this.loadPersistedState(),
    } as Parameters<typeof buildConverseController>[0]);

    this.applyState(this.controller.state);
    this.controller.subscribe((state) => {
      this.applyState(state);
      this.persistState();
    });
  }

  submit(prompt: string): void {
    if (prompt) {
      this.controller.submit({prompt});
    }
  }

  retry(turnId: string): void {
    this.controller.retry({id: turnId});
  }

  resetConversation(): void {
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
    window.location.reload();
  }

  private applyState(state: ConverseControllerState): void {
    const {turns, activeTurn, isStreaming} = state;

    this.busy.set(isStreaming);
    this.turns.set(turns);
    this.adapter.processSurfaces(this.collectSurfaces(state.turns));

    if (activeTurn) {
      this.reasoningText.set(
        isStreaming ? (activeTurn.agentResponse?.reasoningContent ?? '') : ''
      );
      this.activeTurnError.set(
        activeTurn.status === 'error'
          ? (activeTurn.error ?? 'An error occurred')
          : ''
      );
      this.toolActivity.set(activeTurn.agentResponse?.toolCalls ?? []);
    } else {
      this.reasoningText.set('');
      this.activeTurnError.set('');
      this.toolActivity.set([]);
    }
  }

  private collectSurfaces(turns: Turn[]): A2UISurface[] {
    for (let i = turns.length - 1; i >= 0; i--) {
      if (turns[i].agentResponse?.surfaces?.length) {
        return turns[i].agentResponse!.surfaces;
      }
    }
    return [];
  }

  private loadPersistedState(): SerializedConverseState | undefined {
    const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SerializedConverseState) : undefined;
  }

  private persistState(): void {
    const serialized = this.controller.serialize();
    localStorage.setItem(CONVERSATION_STORAGE_KEY, JSON.stringify(serialized));
  }
}

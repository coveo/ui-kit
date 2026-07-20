import {Injectable, inject, signal} from '@angular/core';
import {
  buildGenerativeInterface,
  buildConverseController,
  type ConverseController,
  type ConverseControllerState,
  type SerializedConverseState,
} from '@coveo/thermidor';
import {EngineService} from './engine.service';
import {parseSurfaces} from '../a2ui-parser';
import {CONVERSATION_STORAGE_KEY} from '../constants';
import type {
  A2UISurface,
  RenderableCommerceSurface,
  RoutedInterface,
  ToolCall,
  Turn,
} from '../models';

@Injectable({providedIn: 'root'})
export class ConversationService {
  private readonly engineService = inject(EngineService);
  private readonly controller: ConverseController;

  readonly busy = signal(false);
  readonly turns = signal<Turn[]>([]);
  readonly reasoningText = signal('');
  readonly toolActivity = signal<ToolCall[]>([]);
  readonly surfaces = signal<RenderableCommerceSurface[]>([]);
  readonly routedInterface = signal<RoutedInterface | undefined>(undefined);
  readonly activeTurnId = signal<string | undefined>(undefined);
  readonly activeTurnError = signal('');

  constructor() {
    const generativeInterface = buildGenerativeInterface({
      engine: this.engineService.engine,
    });

    this.controller = buildConverseController({
      interface: generativeInterface,
      conversationToRestore: this.loadPersistedState(),
    });

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
    this.controller.clear();
    localStorage.removeItem(CONVERSATION_STORAGE_KEY);
  }

  private applyState(state: ConverseControllerState): void {
    const {turns, activeTurn, isStreaming} = state;

    this.busy.set(isStreaming);
    this.turns.set(turns);
    this.activeTurnId.set(activeTurn?.id);
    this.surfaces.set(this.buildSurfaces(turns));
    this.routedInterface.set(activeTurn?.routedInterface);

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

  private buildSurfaces(turns: Turn[]): RenderableCommerceSurface[] {
    let latestSurfaces: A2UISurface[] | undefined;
    let turnComplete = true;

    for (const turn of turns) {
      if (turn.agentResponse?.surfaces?.length) {
        latestSurfaces = turn.agentResponse.surfaces;
        turnComplete = turn.status !== 'streaming';
      }
    }

    return parseSurfaces(latestSurfaces, {turnComplete});
  }

  private loadPersistedState(): SerializedConverseState | undefined {
    try {
      const raw = localStorage.getItem(CONVERSATION_STORAGE_KEY);
      return raw ? (JSON.parse(raw) as SerializedConverseState) : undefined;
    } catch {
      return undefined;
    }
  }

  private persistState(): void {
    try {
      const serialized = this.controller.serialize();
      localStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        JSON.stringify(serialized)
      );
    } catch {
      // Ignore persistence failures (e.g., storage disabled/quota exceeded).
    }
  }
}

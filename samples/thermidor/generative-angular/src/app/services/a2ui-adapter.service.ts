import {Injectable, inject, signal} from '@angular/core';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import type {A2uiMessage} from '@a2ui/web_core/v0_9';

@Injectable({providedIn: 'root'})
export class A2uiAdapterService {
  private readonly renderer = inject(A2uiRendererService);

  readonly surfaceIds = signal<string[]>([]);

  processOperations(operations: unknown[]): void {
    this.renderer.processMessages(operations as A2uiMessage[]);
    this.surfaceIds.set([...this.renderer.surfaceGroup.surfacesMap.keys()]);
  }

  reset(): void {
    const ids = [...this.renderer.surfaceGroup.surfacesMap.keys()];
    if (ids.length === 0) return;
    const deletes: A2uiMessage[] = ids.map((surfaceId) => ({
      version: 'v0.9' as const,
      deleteSurface: {surfaceId},
    }));
    this.renderer.processMessages(deletes);
    this.surfaceIds.set([]);
  }
}

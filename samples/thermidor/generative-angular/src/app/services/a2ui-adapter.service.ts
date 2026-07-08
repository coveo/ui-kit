import {Injectable, inject, signal} from '@angular/core';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import type {A2uiMessage} from '@a2ui/web_core/v0_9';
import type {A2UISurface} from '@coveo/thermidor';

@Injectable({providedIn: 'root'})
export class A2uiAdapterService {
  private readonly renderer = inject(A2uiRendererService);
  private activeSurfaceIds: string[] = [];

  readonly surfaceIds = signal<string[]>([]);

  processSurfaces(surfaces: A2UISurface[]): void {
    this.reset();
    for (const surface of surfaces) {
      const ops = (surface as {operations?: unknown[]}).operations;
      if (!Array.isArray(ops)) continue;
      this.renderer.processMessages(ops as A2uiMessage[]);
    }
    this.activeSurfaceIds = [...this.renderer.surfaceGroup.surfacesMap.keys()];
    this.surfaceIds.set(this.activeSurfaceIds);
  }

  reset(): void {
    if (this.activeSurfaceIds.length === 0) return;
    const deletes: A2uiMessage[] = this.activeSurfaceIds.map((surfaceId) => ({
      version: 'v0.9' as const,
      deleteSurface: {surfaceId},
    }));
    this.renderer.processMessages(deletes);
    this.activeSurfaceIds = [];
    this.surfaceIds.set([]);
  }
}

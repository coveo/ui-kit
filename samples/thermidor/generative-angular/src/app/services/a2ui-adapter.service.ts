import {Injectable, inject} from '@angular/core';
import {A2uiRendererService} from '@a2ui/angular/v0_9';
import type {A2uiMessage} from '@a2ui/web_core/v0_9';
import type {A2UISurface} from '@coveo/thermidor';

type SurfaceRecord = {operations?: unknown[]};

@Injectable({providedIn: 'root'})
export class A2uiAdapterService {
  private readonly renderer = inject(A2uiRendererService);
  private activeSurfaceIds = new Set<string>();

  processSurfaces(surfaces: A2UISurface[]): void {
    const incomingSurfaceIds = this.extractSurfaceIds(surfaces);
    this.deleteStalesSurfaces(incomingSurfaceIds);
    this.forwardOperations(surfaces);
    this.activeSurfaceIds = incomingSurfaceIds;
  }

  reset(): void {
    this.deleteSurfaces(this.activeSurfaceIds);
    this.activeSurfaceIds.clear();
  }

  private extractSurfaceIds(surfaces: A2UISurface[]): Set<string> {
    const ids = new Set<string>();
    for (const surface of surfaces) {
      const {operations} = surface as SurfaceRecord;
      if (!Array.isArray(operations)) continue;
      for (const op of operations as Record<string, any>[]) {
        if (op.createSurface?.surfaceId) {
          ids.add(op.createSurface.surfaceId);
        }
      }
    }
    return ids;
  }

  private deleteStalesSurfaces(incomingIds: Set<string>): void {
    const staleIds = new Set(
      [...this.activeSurfaceIds].filter((id) => !incomingIds.has(id))
    );
    this.deleteSurfaces(staleIds);
  }

  private deleteSurfaces(ids: Set<string>): void {
    if (ids.size === 0) return;
    const messages: A2uiMessage[] = [...ids].map((surfaceId) => ({
      version: 'v0.9' as const,
      deleteSurface: {surfaceId},
    }));
    this.renderer.processMessages(messages);
  }

  private forwardOperations(surfaces: A2UISurface[]): void {
    for (const surface of surfaces) {
      const {operations} = surface as SurfaceRecord;
      if (!Array.isArray(operations)) continue;
      try {
        this.renderer.processMessages(operations as A2uiMessage[]);
      } catch (error) {
        console.error('[A2uiAdapterService]', error);
      }
    }
  }
}

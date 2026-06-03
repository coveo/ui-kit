import type {ConversationControllerActivity} from '@coveo/headless-future';
import {useMemo} from 'react';

interface ConversationActivitiesProps {
  activities: ConversationControllerActivity[];
}

interface SurfaceState {
  surfaceId: string;
  root: string;
  catalogId?: string;
  components: Array<{id: string; component: Record<string, unknown>}>;
  dataModel: Map<string, DataModelEntry>;
}

interface DataModelEntry {
  key: string;
  valueString?: string;
  valueNumber?: number;
  valueBoolean?: boolean;
  valueMap?: Array<unknown>;
}

function buildSurfaces(
  activities: ConversationControllerActivity[]
): SurfaceState[] {
  const surfaceMap = new Map<string, SurfaceState>();

  for (const activity of activities) {
    for (const operation of activity.operations) {
      if ('beginRendering' in operation) {
        const {surfaceId, root, catalogId} = operation.beginRendering;
        surfaceMap.set(surfaceId, {
          surfaceId,
          root,
          catalogId,
          components: [],
          dataModel: new Map(),
        });
      } else if ('surfaceUpdate' in operation) {
        const {surfaceId, components} = operation.surfaceUpdate;
        const surface = surfaceMap.get(surfaceId);
        if (surface) {
          for (const incoming of components) {
            const existingIndex = surface.components.findIndex(
              (c) => c.id === incoming.id
            );
            if (existingIndex !== -1) {
              surface.components[existingIndex] = incoming;
            } else {
              surface.components.push(incoming);
            }
          }
        }
      } else if ('dataModelUpdate' in operation) {
        const {surfaceId, contents} = operation.dataModelUpdate;
        const surface = surfaceMap.get(surfaceId);
        if (surface) {
          for (const entry of contents) {
            surface.dataModel.set(entry.key, entry);
          }
        }
      } else if ('deleteSurface' in operation) {
        surfaceMap.delete(operation.deleteSurface.surfaceId);
      }
    }
  }

  return Array.from(surfaceMap.values());
}

function getDisplayValue(entry: DataModelEntry): string {
  if (entry.valueString !== undefined) return entry.valueString;
  if (entry.valueNumber !== undefined) return String(entry.valueNumber);
  if (entry.valueBoolean !== undefined) return String(entry.valueBoolean);
  if (entry.valueMap !== undefined) return JSON.stringify(entry.valueMap);
  return '(empty)';
}

export function ConversationActivities({
  activities,
}: ConversationActivitiesProps) {
  const surfaces = useMemo(() => buildSurfaces(activities), [activities]);

  if (surfaces.length === 0) {
    return null;
  }

  return (
    <section aria-label="A2UI Surfaces">
      <h2>Activities</h2>
      {surfaces.map((surface) => (
        <article key={surface.surfaceId} className="surface-card">
          <h3>
            Surface: <code>{surface.surfaceId}</code>
          </h3>
          <dl className="surface-meta">
            <dt>Root</dt>
            <dd>{surface.root}</dd>
            {surface.catalogId && (
              <>
                <dt>Catalog</dt>
                <dd>{surface.catalogId}</dd>
              </>
            )}
          </dl>

          {surface.components.length > 0 && (
            <details open>
              <summary>Components ({surface.components.length})</summary>
              <ul className="component-list">
                {surface.components.map((comp) => (
                  <li key={comp.id}>
                    <strong>{comp.id}</strong>
                    <pre>{JSON.stringify(comp.component, null, 2)}</pre>
                  </li>
                ))}
              </ul>
            </details>
          )}

          {surface.dataModel.size > 0 && (
            <details open>
              <summary>Data Model ({surface.dataModel.size} entries)</summary>
              <table className="data-model-table">
                <thead>
                  <tr>
                    <th>Key</th>
                    <th>Value</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from(surface.dataModel.values()).map((entry) => (
                    <tr key={entry.key}>
                      <td>
                        <code>{entry.key}</code>
                      </td>
                      <td>{getDisplayValue(entry)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </details>
          )}
        </article>
      ))}
    </section>
  );
}

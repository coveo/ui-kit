import type {Activity} from '@coveo/thermidor';

type ControllerAdvertisement = {
  controllerId: string;
  controllerSchema: string;
};

type CatalogComponent = {
  id: string;
  component: string;
  controllers: Record<string, ControllerAdvertisement>;
};

export type CatalogSurface = {
  id: string;
  catalogId: string;
  components: CatalogComponent[];
  controllers: Record<string, Record<string, unknown>>;
};

type MutableCatalogSurface = CatalogSurface;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getOperations(activity: Activity): Record<string, unknown>[] {
  if (activity.kind !== 'a2ui-surface' || !isRecord(activity.payload)) {
    return [];
  }

  const operations = activity.payload['a2ui_operations'];
  return Array.isArray(operations) ? operations.filter(isRecord) : [];
}

function getOrCreateSurface(
  surfaces: Map<string, MutableCatalogSurface>,
  id: string,
  catalogId = ''
): MutableCatalogSurface {
  const existing = surfaces.get(id);
  if (existing) {
    return existing;
  }

  const surface = {id, catalogId, components: [], controllers: {}};
  surfaces.set(id, surface);
  return surface;
}

/**
 * This is the sample's A2-UI boundary. It interprets only the v0.9 catalog
 * operations and keeps the application-facing result independent of Thermidor.
 */
export function toCatalogSurfaces(activities: Activity[]): CatalogSurface[] {
  const surfaces = new Map<string, MutableCatalogSurface>();

  for (const activity of activities) {
    const operations = getOperations(activity);
    if (operations.length === 0) {
      continue;
    }
    if (activity.replace) {
      surfaces.clear();
    }

    for (const operation of operations) {
      const createSurface = operation['createSurface'];
      if (isRecord(createSurface) && typeof createSurface['surfaceId'] === 'string') {
        getOrCreateSurface(
          surfaces,
          createSurface['surfaceId'],
          typeof createSurface['catalogId'] === 'string' ? createSurface['catalogId'] : ''
        );
        continue;
      }

      const updateComponents = operation['updateComponents'];
      if (isRecord(updateComponents) && typeof updateComponents['surfaceId'] === 'string') {
        const surface = getOrCreateSurface(surfaces, updateComponents['surfaceId']);
        surface.components = Array.isArray(updateComponents['components'])
          ? updateComponents['components'].filter(isCatalogComponent)
          : [];
        continue;
      }

      const updateDataModel = operation['updateDataModel'];
      if (!isRecord(updateDataModel) || typeof updateDataModel['surfaceId'] !== 'string') {
        continue;
      }
      const value = updateDataModel['value'];
      const controllers =
        isRecord(value) && isRecord(value['controllers']) ? value['controllers'] : {};
      const surface = getOrCreateSurface(surfaces, updateDataModel['surfaceId']);
      surface.controllers = Object.fromEntries(
        Object.entries(controllers).filter(([, state]) => isRecord(state))
      ) as Record<string, Record<string, unknown>>;
    }
  }

  return [...surfaces.values()];
}

function isCatalogComponent(value: unknown): value is CatalogComponent {
  return (
    isRecord(value) &&
    typeof value['id'] === 'string' &&
    typeof value['component'] === 'string' &&
    isRecord(value['controllers'])
  );
}

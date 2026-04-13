import type {
  BundleTierConfig,
  CatalogComponent,
  NextAction,
  Product,
  ServerToClientMessage,
  ValueMapEntry,
} from '../types/commerce.js';

export function extractProductsBySurface(
  operations: ServerToClientMessage[]
): Map<string, Product[]> {
  const bySurface = new Map<string, Map<string, Product>>();

  const getSurfaceProductsById = (surfaceId: string): Map<string, Product> => {
    const existing = bySurface.get(surfaceId);
    if (existing) return existing;
    const created = new Map<string, Product>();
    bySurface.set(surfaceId, created);
    return created;
  };

  for (const op of operations) {
    if (!op.dataModelUpdate) continue;
    const surfaceId = normalizeSurfaceId(op.dataModelUpdate.surfaceId ?? '');
    if (!surfaceId || isPlaceholderSurface(surfaceId)) continue;

    for (const collection of op.dataModelUpdate.contents) {
      if (!collection.valueMap) continue;

      for (const item of collection.valueMap) {
        if (!item.valueMap) continue;
        const record = valueMapToRecord(item.valueMap);
        if (isProductRecord(record)) {
          const surfaceProductsById = getSurfaceProductsById(surfaceId);
          // Last event wins. Re-insert to preserve latest occurrence order.
          surfaceProductsById.delete(record.ec_product_id);
          surfaceProductsById.set(record.ec_product_id, record);
        }
      }
    }
  }

  return new Map(
    Array.from(bySurface.entries(), ([surfaceId, productsById]) => [
      surfaceId,
      Array.from(productsById.values()),
    ])
  );
}

export function extractActionsBySurface(
  operations: ServerToClientMessage[]
): Map<string, NextAction[]> {
  const bySurface = new Map<string, NextAction[]>();

  for (const op of operations) {
    if (!op.dataModelUpdate) continue;
    const surfaceId = normalizeSurfaceId(op.dataModelUpdate.surfaceId ?? '');
    if (!surfaceId || isPlaceholderSurface(surfaceId)) continue;

    for (const collection of op.dataModelUpdate.contents) {
      const normalizedKey = collection.key.trim().toLowerCase();
      if (normalizedKey !== 'actions' || !collection.valueMap) continue;

      const surfaceActions = bySurface.get(surfaceId) ?? [];
      if (!bySurface.has(surfaceId)) {
        bySurface.set(surfaceId, surfaceActions);
      }

      for (const item of collection.valueMap) {
        if (!item.valueMap) continue;
        const record = valueMapToRecord(item.valueMap);
        surfaceActions.push({
          text: String(record.text ?? ''),
          type: String(record.type ?? 'followup'),
        });
      }
    }
  }

  return bySurface;
}

export function extractCatalogComponents(
  operations: ServerToClientMessage[]
): CatalogComponent[] {
  const components: CatalogComponent[] = [];

  for (const op of operations) {
    if (!op.surfaceUpdate) continue;

    const surfaceId = normalizeSurfaceId(op.surfaceUpdate.surfaceId ?? '');
    if (!surfaceId) continue;

    const isSkeletonSurface = isPlaceholderSurface(surfaceId);
    for (const comp of op.surfaceUpdate.components) {
      if (!comp.component) continue;

      const componentKeys = Object.keys(comp.component);
      if (componentKeys.length !== 1) continue;

      const type = componentKeys[0];
      const props = comp.component[type] as Record<string, unknown>;
      const heading = isSkeletonSurface
        ? ''
        : (extractLiteralOrPath(props.heading) ?? '');
      const attributes = Array.isArray(props?.attributes)
        ? props.attributes.filter(
            (value): value is string => typeof value === 'string'
          )
        : undefined;
      const text = extractLiteralOrPath(props.text);
      const title = isSkeletonSurface
        ? undefined
        : extractLiteralOrPath(props.title);
      const bundles = Array.isArray(props?.bundles)
        ? (props.bundles as BundleTierConfig[])
        : undefined;
      const isLoading = props?.isLoading === true || isSkeletonSurface;

      components.push({
        type,
        heading,
        surfaceId,
        ...(attributes ? {attributes} : {}),
        ...(text ? {text} : {}),
        ...(title ? {title} : {}),
        ...(bundles ? {bundles} : {}),
        ...(isLoading ? {isLoading} : {}),
      });
    }
  }
  return components;
}

function normalizeSurfaceId(id: string): string {
  return id.trim();
}

function isPlaceholderSurface(surfaceId: string): boolean {
  const normalized = surfaceId.trim().toLowerCase();
  return (
    normalized.startsWith('skeleton-surface-') ||
    normalized.includes('skeleton-root-')
  );
}

function valueMapToRecord(
  entries: ValueMapEntry[]
): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  for (const entry of entries) {
    if (entry.valueString != null) record[entry.key] = entry.valueString;
    else if (entry.valueNumber != null) record[entry.key] = entry.valueNumber;
  }
  return record;
}

function extractLiteralOrPath(value: unknown): string | undefined {
  if (!value || typeof value !== 'object') {
    return undefined;
  }

  const candidate = value as {literalString?: unknown; path?: unknown};
  if (typeof candidate.literalString === 'string') {
    return candidate.literalString;
  }

  if (typeof candidate.path === 'string') {
    return candidate.path;
  }

  return undefined;
}

function isProductRecord(
  record: Record<string, string | number | undefined>
): record is Product {
  return (
    typeof record.ec_name === 'string' &&
    typeof record.ec_price === 'number' &&
    typeof record.ec_product_id === 'string'
  );
}

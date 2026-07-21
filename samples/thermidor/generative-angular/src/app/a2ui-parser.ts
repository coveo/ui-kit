/**
 * A2UI-to-Angular render state adapter.
 *
 * Transforms opaque A2UISurface records (containing structured operations)
 * into typed RenderableCommerceSurface objects for the template layer.
 *
 * Single public entry point: `parseSurfaces()`
 */
import type {A2UISurface} from '@coveo/thermidor';
import type {
  A2UIOperation,
  ActivitySnapshotContent,
  BundleDisplayTier,
  CommerceSurfaceComponentType,
  DataModelUpdateOperation,
  NextAction,
  ProductRecord,
  RenderableCommerceSurface,
  SurfaceUpdateOperation,
  ValueMapEntry,
  ValueMapItem,
} from './models';

// ---------------------------------------------------------------------------
// Internal types
// ---------------------------------------------------------------------------

type SurfaceDraft = {
  order: number;
  surfaceId: string;
  componentType: CommerceSurfaceComponentType;
  heading?: string;
  text?: string;
  title?: string;
  attributes?: string[];
  bundles?: BundleDisplayTier[];
  products: ProductRecord[];
  actions: NextAction[];
  isLoading: boolean;
};

// ---------------------------------------------------------------------------
// Value extraction helpers
// ---------------------------------------------------------------------------

function readLiteralOrPath(value: unknown): string {
  if (!value || typeof value !== 'object') return '';
  const v = value as {literalString?: unknown; path?: unknown};
  if (typeof v.literalString === 'string') return v.literalString;
  if (typeof v.path === 'string') return v.path;
  return '';
}

function valueMapToRecord(
  entries: ValueMapEntry[] | undefined
): Record<string, string | number> {
  const record: Record<string, string | number> = {};
  for (const entry of entries ?? []) {
    if (entry.valueString != null) record[entry.key] = entry.valueString;
    else if (entry.valueNumber != null) record[entry.key] = entry.valueNumber;
  }
  return record;
}

function toProductRecord(item: ValueMapItem): ProductRecord | null {
  if (!item.valueMap) return null;

  const r = valueMapToRecord(item.valueMap);
  const id = String(r['ec_product_id'] ?? '').trim();
  const name = String(r['ec_name'] ?? '').trim();
  if (!id || !name) return null;

  return {
    ec_product_id: id,
    ec_name: name,
    ec_brand: String(r['ec_brand'] ?? ''),
    ec_price: Number(r['ec_price'] ?? 0),
    ec_promo_price:
      typeof r['ec_promo_price'] === 'number' ? r['ec_promo_price'] : undefined,
    ec_image: String(r['ec_image'] ?? ''),
    clickUri: String(r['clickUri'] ?? '#'),
    description:
      typeof r['description'] === 'string' ? r['description'] : undefined,
    accent: typeof r['accent'] === 'string' ? r['accent'] : undefined,
  };
}

function toNextAction(item: ValueMapItem): NextAction | null {
  if (!item.valueMap) return null;
  const r = valueMapToRecord(item.valueMap);
  const text = String(r['text'] ?? '').trim();
  const type = String(r['type'] ?? 'followup').trim();
  if (!text || (type !== 'search' && type !== 'followup')) return null;
  return {text, type};
}

// ---------------------------------------------------------------------------
// Draft management
// ---------------------------------------------------------------------------

function ensureDraft(
  drafts: Map<string, SurfaceDraft>,
  surfaceId: string,
  componentType: CommerceSurfaceComponentType
): SurfaceDraft {
  const existing = drafts.get(surfaceId);
  if (existing) {
    existing.componentType = componentType;
    return existing;
  }

  const draft: SurfaceDraft = {
    order: drafts.size,
    surfaceId,
    componentType,
    products: [],
    actions: [],
    isLoading: false,
  };
  drafts.set(surfaceId, draft);
  return draft;
}

// ---------------------------------------------------------------------------
// Operation processing (single pass over all snapshots)
// ---------------------------------------------------------------------------

function processOperations(allSurfaces: A2UISurface[]): {
  drafts: Map<string, SurfaceDraft>;
  productsBySurface: Map<string, ProductRecord[]>;
} {
  const drafts = new Map<string, SurfaceDraft>();
  const productsBySurface = new Map<string, ProductRecord[]>();

  for (const raw of allSurfaces) {
    const content = raw as unknown as ActivitySnapshotContent;
    if (!content.operations || !Array.isArray(content.operations)) continue;

    for (const op of content.operations as A2UIOperation[]) {
      if ('surfaceUpdate' in op && op.surfaceUpdate) {
        const {surfaceId, components} = (op as SurfaceUpdateOperation)
          .surfaceUpdate;

        for (const component of components) {
          const keys = Object.keys(component.component ?? {});
          if (keys.length !== 1) continue;

          const type = keys[0] as CommerceSurfaceComponentType;
          if (type === 'ProductCard') continue;

          const payload = (
            component.component as Record<string, Record<string, unknown>>
          )[type];
          const draft = ensureDraft(drafts, surfaceId, type);

          if (type === 'ProductCarousel') {
            draft.heading = readLiteralOrPath(payload?.['heading']);
            draft.isLoading = payload?.['isLoading'] === true;
          } else if (type === 'ComparisonTable') {
            draft.heading = readLiteralOrPath(payload?.['heading']);
            draft.attributes = Array.isArray(payload?.['attributes'])
              ? payload['attributes'].filter(
                  (v): v is string => typeof v === 'string'
                )
              : [];
            draft.isLoading = payload?.['isLoading'] === true;
          } else if (type === 'ComparisonSummary') {
            draft.text = readLiteralOrPath(payload?.['text']);
          } else if (type === 'BundleDisplay') {
            draft.title = readLiteralOrPath(payload?.['title']);
            draft.bundles = Array.isArray(payload?.['bundles'])
              ? (payload['bundles'] as BundleDisplayTier[])
              : draft.bundles;
            draft.isLoading = payload?.['isLoading'] === true;
          } else if (type === 'NextActionsBar') {
            draft.isLoading = payload?.['isLoading'] === true;
          }
        }
      }

      if ('dataModelUpdate' in op && op.dataModelUpdate) {
        const {surfaceId, contents} = (op as DataModelUpdateOperation)
          .dataModelUpdate;

        for (const entry of contents) {
          if (entry.key === 'items') {
            productsBySurface.set(
              surfaceId,
              (entry.valueMap ?? [])
                .map(toProductRecord)
                .filter((p): p is ProductRecord => p !== null)
            );
          }
          if (entry.key === 'actions') {
            const draft = ensureDraft(drafts, surfaceId, 'NextActionsBar');
            draft.actions = (entry.valueMap ?? [])
              .map(toNextAction)
              .filter((a): a is NextAction => a !== null);
          }
        }
      }
    }
  }

  return {drafts, productsBySurface};
}

// ---------------------------------------------------------------------------
// Draft → RenderableCommerceSurface conversion
// ---------------------------------------------------------------------------

function buildBundleTiers(
  rawBundles: unknown,
  productsBySurface: Map<string, ProductRecord[]>
): BundleDisplayTier[] {
  if (!Array.isArray(rawBundles)) return [];

  return rawBundles
    .filter((b): b is Record<string, unknown> => !!b && typeof b === 'object')
    .map((bundle) => ({
      bundleId: String(bundle['bundleId'] ?? ''),
      label: String(bundle['label'] ?? ''),
      description: String(bundle['description'] ?? ''),
      slots: Array.isArray(bundle['slots'])
        ? bundle['slots']
            .filter(
              (s): s is Record<string, unknown> => !!s && typeof s === 'object'
            )
            .map((slot) => {
              const ref = String(slot['surfaceRef'] ?? '');
              return {
                categoryLabel: String(slot['categoryLabel'] ?? ''),
                surfaceRef: ref,
                product:
                  productsBySurface.get(ref)?.[0] ??
                  (slot['product'] as ProductRecord | null | undefined) ??
                  null,
              };
            })
        : [],
    }));
}

function draftToSurface(
  draft: SurfaceDraft,
  productsBySurface: Map<string, ProductRecord[]>
): RenderableCommerceSurface | null {
  switch (draft.componentType) {
    case 'ProductCarousel':
      return {
        surfaceId: draft.surfaceId,
        componentType: 'ProductCarousel',
        heading: draft.heading ?? '',
        products: productsBySurface.get(draft.surfaceId) ?? draft.products,
        isLoading: draft.isLoading,
      };
    case 'ComparisonTable':
      return {
        surfaceId: draft.surfaceId,
        componentType: 'ComparisonTable',
        heading: draft.heading ?? '',
        attributes: draft.attributes ?? [],
        products: productsBySurface.get(draft.surfaceId) ?? draft.products,
        isLoading: draft.isLoading,
      };
    case 'ComparisonSummary':
      return {
        surfaceId: draft.surfaceId,
        componentType: 'ComparisonSummary',
        text: draft.text ?? '',
      };
    case 'BundleDisplay':
      return {
        surfaceId: draft.surfaceId,
        componentType: 'BundleDisplay',
        title: draft.title ?? draft.heading ?? '',
        bundles: buildBundleTiers(draft.bundles, productsBySurface),
        isLoading: draft.isLoading,
      };
    case 'NextActionsBar':
      return {
        surfaceId: draft.surfaceId,
        componentType: 'NextActionsBar',
        actions: draft.actions,
        isLoading: draft.isLoading,
      };
    default:
      return null;
  }
}

// ---------------------------------------------------------------------------
// Deduplication
// ---------------------------------------------------------------------------

function surfaceHasContent(s: RenderableCommerceSurface): boolean {
  switch (s.componentType) {
    case 'ProductCarousel':
    case 'ComparisonTable':
      return s.products.length > 0;
    case 'NextActionsBar':
      return s.actions.length > 0;
    case 'BundleDisplay':
      return s.bundles.length > 0;
    case 'ComparisonSummary':
      return s.text.length > 0;
    default:
      return true;
  }
}

function deduplicate(
  surfaces: RenderableCommerceSurface[]
): RenderableCommerceSurface[] {
  const byType = new Map<string, RenderableCommerceSurface[]>();

  for (const s of surfaces) {
    const list = byType.get(s.componentType) ?? [];
    list.push(s);
    byType.set(s.componentType, list);
  }

  const result: RenderableCommerceSurface[] = [];

  for (const [, group] of byType) {
    if (group.length === 1) {
      result.push(group[0]);
      continue;
    }
    const withContent = group.filter(surfaceHasContent);
    result.push(...(withContent.length > 0 ? withContent : [group[0]]));
  }

  return result.sort((a, b) => surfaces.indexOf(a) - surfaces.indexOf(b));
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse raw A2UI surface records into deduplicated, render-ready surfaces.
 */
export function parseSurfaces(
  rawSurfaces: A2UISurface[] | undefined,
  options: {turnComplete: boolean} = {turnComplete: false}
): RenderableCommerceSurface[] {
  if (!rawSurfaces || rawSurfaces.length === 0) return [];

  const {drafts, productsBySurface} = processOperations(rawSurfaces);

  let surfaces = [...drafts.values()]
    .sort((a, b) => a.order - b.order)
    .map((draft) => draftToSurface(draft, productsBySurface))
    .filter((s): s is RenderableCommerceSurface => s !== null);

  if (options.turnComplete) {
    surfaces = surfaces.map((s) =>
      'isLoading' in s && s.isLoading ? {...s, isLoading: false} : s
    );
  }

  return deduplicate(surfaces);
}

import {useMemo} from 'react';
import {A2UIProductCarousel} from '../ProductCarousel/ProductCarousel.js';
import {A2UIBundleDisplay} from '../BundleDisplay/BundleDisplay.js';
import {A2UINextActionsBar} from '../NextActionsBar/NextActionsBar.js';
import {A2UIComparisonTable} from '../ComparisonTable/ComparisonTable.js';
import {A2UIComparisonSummary} from '../ComparisonSummary/ComparisonSummary.js';
import {A2UISkeleton} from '../Skeleton/Skeleton.js';
import {parseSurfaceSnapshot, type ParsedSurface} from '../types.js';
import styles from './SurfaceRenderer.module.css';

type A2UISurface = Record<string, unknown>;

const KNOWN_COMPONENTS = new Set([
  'ProductCarousel',
  'BundleDisplay',
  'NextActionsBar',
  'ComparisonTable',
  'ComparisonSummary',
]);

export interface SurfaceRendererProps {
  surfaces: A2UISurface[];
  onAction?: (text: string, type: string) => void;
  isStreaming?: boolean;
  pendingSkeletons?: string[];
}

interface RenderEntry {
  type: 'real';
  surface: ParsedSurface;
}

interface SkeletonEntry {
  type: 'skeleton';
  surfaceId: string;
  componentType: string;
}

type RenderItem = RenderEntry | SkeletonEntry;

export function SurfaceRenderer({
  surfaces,
  onAction,
  isStreaming = true,
  pendingSkeletons = [],
}: SurfaceRendererProps) {
  const allParsed = useMemo(() => {
    const result: ParsedSurface[] = [];
    for (const surface of surfaces) {
      result.push(...parseSurfaceSnapshot(surface));
    }
    return result;
  }, [surfaces]);

  const renderItems = useMemo(() => {
    const known = allParsed.filter((s) => KNOWN_COMPONENTS.has(s.componentType));

    const realSurfaces: ParsedSurface[] = [];
    const realDedupIds = new Set<string>();
    const realCountByType = new Map<string, number>();
    const skeletonIdsByType = new Map<string, Set<string>>();

    for (const s of known) {
      const props = s.componentProps as Record<string, unknown>;
      const isLoading = s.surfaceId.startsWith('skeleton-') || props.isLoading === true;

      if (isLoading) {
        const ids = skeletonIdsByType.get(s.componentType) ?? new Set();
        ids.add(s.surfaceId);
        skeletonIdsByType.set(s.componentType, ids);
      } else if (!realDedupIds.has(s.surfaceId)) {
        realDedupIds.add(s.surfaceId);
        realSurfaces.push(s);
        realCountByType.set(s.componentType, (realCountByType.get(s.componentType) ?? 0) + 1);
      }
    }

    for (const [, ids] of skeletonIdsByType) {
      const hasSpecific = [...ids].some((id) => !id.endsWith('-default'));
      if (hasSpecific) {
        for (const id of [...ids]) {
          if (id.endsWith('-default')) {
            ids.delete(id);
          }
        }
      }
    }

    const items: RenderItem[] = [];

    for (const s of realSurfaces) {
      items.push({type: 'real', surface: s});
    }

    if (isStreaming) {
      // Legacy skeleton surfaces from the stream
      for (const [componentType, skeletonIds] of skeletonIdsByType) {
        const realCount = realCountByType.get(componentType) ?? 0;
        const remaining = Math.max(0, skeletonIds.size - realCount);
        const exampleId = skeletonIds.values().next().value!;
        for (let i = 0; i < remaining; i++) {
          items.push({
            type: 'skeleton',
            surfaceId: `${exampleId}-remaining-${i}`,
            componentType,
          });
        }
      }

      // Skeletons from pending render plan (tool call hints)
      for (const componentType of pendingSkeletons) {
        const realCount = realCountByType.get(componentType) ?? 0;
        if (realCount === 0) {
          items.push({
            type: 'skeleton',
            surfaceId: `pending-${componentType}`,
            componentType,
          });
        }
      }
    }

    return items;
  }, [allParsed, isStreaming, pendingSkeletons]);

  if (renderItems.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {renderItems.map((item) => {
        if (item.type === 'skeleton') {
          return <A2UISkeleton key={item.surfaceId} componentType={item.componentType} />;
        }
        return (
          <A2UISurfaceComponent
            key={item.surface.surfaceId}
            surface={item.surface}
            allSurfaces={allParsed}
            onAction={onAction}
          />
        );
      })}
    </div>
  );
}

interface A2UISurfaceComponentProps {
  surface: ParsedSurface;
  allSurfaces: ParsedSurface[];
  onAction?: (text: string, type: string) => void;
}

function A2UISurfaceComponent({surface, allSurfaces, onAction}: A2UISurfaceComponentProps) {
  switch (surface.componentType) {
    case 'ProductCarousel':
      return <A2UIProductCarousel surface={surface} />;
    case 'BundleDisplay':
      return <A2UIBundleDisplay surface={surface} allSurfaces={allSurfaces} />;
    case 'NextActionsBar':
      return <A2UINextActionsBar surface={surface} onAction={onAction} />;
    case 'ComparisonTable':
      return <A2UIComparisonTable surface={surface} />;
    case 'ComparisonSummary':
      return <A2UIComparisonSummary surface={surface} />;
    default:
      return null;
  }
}

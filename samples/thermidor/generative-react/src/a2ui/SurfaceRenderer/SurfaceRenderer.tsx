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

export function SurfaceRenderer({surfaces, onAction}: SurfaceRendererProps) {
  const allParsed = useMemo(() => {
    const result: ParsedSurface[] = [];
    for (const surface of surfaces) {
      result.push(...parseSurfaceSnapshot(surface));
    }
    return result;
  }, [surfaces]);

  const renderItems = useMemo(() => {
    const known = allParsed.filter((s) => KNOWN_COMPONENTS.has(s.componentType));

    const skeletons: ParsedSurface[] = [];
    const real: ParsedSurface[] = [];

    for (const s of known) {
      const props = s.componentProps as Record<string, unknown>;
      if (s.surfaceId.startsWith('skeleton-') || props.isLoading === true) {
        skeletons.push(s);
      } else {
        real.push(s);
      }
    }

    const dedupedIds = new Set<string>();
    const dedupedReal: ParsedSurface[] = [];
    for (const s of real) {
      if (dedupedIds.has(s.surfaceId)) continue;
      dedupedIds.add(s.surfaceId);
      dedupedReal.push(s);
    }

    const realComponentTypes = new Set(dedupedReal.map((s) => s.componentType));

    const items: RenderItem[] = [];

    const dedupedSkeletonTypes = new Set<string>();
    for (const s of skeletons) {
      if (realComponentTypes.has(s.componentType)) continue;
      if (dedupedSkeletonTypes.has(s.componentType)) continue;
      dedupedSkeletonTypes.add(s.componentType);
      items.push({
        type: 'skeleton',
        surfaceId: s.surfaceId,
        componentType: s.componentType,
      });
    }

    for (const s of dedupedReal) {
      items.push({type: 'real', surface: s});
    }

    return items;
  }, [allParsed]);

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

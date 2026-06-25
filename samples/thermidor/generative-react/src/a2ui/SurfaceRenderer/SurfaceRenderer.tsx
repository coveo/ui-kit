import {useMemo} from 'react';
import {A2UIViewer, type A2UIActionEvent} from '@a2ui/react/v0_8';
import {A2UIProductCarousel} from '../ProductCarousel/ProductCarousel.js';
import {A2UIBundleDisplay} from '../BundleDisplay/BundleDisplay.js';
import {A2UINextActionsBar} from '../NextActionsBar/NextActionsBar.js';
import {A2UIComparisonTable} from '../ComparisonTable/ComparisonTable.js';
import {A2UIComparisonSummary} from '../ComparisonSummary/ComparisonSummary.js';
import {A2UISkeleton} from '../Skeleton/Skeleton.js';
import {parseSurfaceSnapshot, type ParsedSurface} from '../types.js';
import styles from './SurfaceRenderer.module.css';

type A2UISurface = Record<string, unknown>;

const CUSTOM_COMPONENTS = new Set([
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

interface RealEntry {
  type: 'real';
  surface: ParsedSurface;
}

interface SkeletonEntry {
  type: 'skeleton';
  surfaceId: string;
  componentType: string;
}

type RenderItem = RealEntry | SkeletonEntry;

export function SurfaceRenderer({surfaces, onAction}: SurfaceRendererProps) {
  const allParsed = useMemo(() => {
    const result: ParsedSurface[] = [];
    for (const surface of surfaces) {
      result.push(...parseSurfaceSnapshot(surface));
    }
    return result;
  }, [surfaces]);

  const renderItems = useMemo(() => {
    const skeletons: ParsedSurface[] = [];
    const real: ParsedSurface[] = [];

    for (const s of allParsed) {
      const props = s.componentProps as Record<string, unknown>;
      if (s.surfaceId.startsWith('skeleton-') || props.isLoading === true) {
        skeletons.push(s);
      } else if (s.componentType) {
        real.push(s);
      }
    }

    const dedupedIds = new Set<string>();
    const dedupedReal: ParsedSurface[] = [];
    for (const s of real) {
      if (!dedupedIds.has(s.surfaceId)) {
        dedupedIds.add(s.surfaceId);
        dedupedReal.push(s);
      }
    }

    const realComponentTypes = new Set(dedupedReal.map((s) => s.componentType));

    const items: RenderItem[] = [];

    const dedupedSkeletonTypes = new Set<string>();
    for (const s of skeletons) {
      if (
        !realComponentTypes.has(s.componentType) &&
        !dedupedSkeletonTypes.has(s.componentType)
      ) {
        dedupedSkeletonTypes.add(s.componentType);
        items.push({
          type: 'skeleton',
          surfaceId: s.surfaceId,
          componentType: s.componentType,
        });
      }
    }

    for (const s of dedupedReal) {
      items.push({type: 'real', surface: s});
    }

    return items;
  }, [allParsed]);

  if (renderItems.length === 0) {
    return null;
  }

  const handleA2UIAction = onAction
    ? (event: A2UIActionEvent) => {
        const text = (event.context?.text as string) ?? event.actionName ?? '';
        const type =
          (event.context?.type as string) ?? event.actionName ?? 'action';
        onAction(text, type);
      }
    : undefined;

  return (
    <div className={styles.container}>
      {renderItems.map((item) => {
        if (item.type === 'skeleton') {
          return (
            <A2UISkeleton
              key={item.surfaceId}
              componentType={item.componentType}
            />
          );
        }

        if (CUSTOM_COMPONENTS.has(item.surface.componentType)) {
          return (
            <CustomSurfaceComponent
              key={item.surface.surfaceId}
              surface={item.surface}
              allSurfaces={allParsed}
              onAction={onAction}
            />
          );
        }

        return (
          <A2UIViewer
            key={item.surface.surfaceId}
            root={item.surface.rootId}
            components={item.surface.components}
            data={item.surface.data}
            onAction={handleA2UIAction}
          />
        );
      })}
    </div>
  );
}

interface CustomSurfaceComponentProps {
  surface: ParsedSurface;
  allSurfaces: ParsedSurface[];
  onAction?: (text: string, type: string) => void;
}

function CustomSurfaceComponent({
  surface,
  allSurfaces,
  onAction,
}: CustomSurfaceComponentProps) {
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

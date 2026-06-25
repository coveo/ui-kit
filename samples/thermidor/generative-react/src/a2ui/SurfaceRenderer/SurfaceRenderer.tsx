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

export function SurfaceRenderer({surfaces, onAction}: SurfaceRendererProps) {
  const allParsed = useMemo(() => {
    const result: ParsedSurface[] = [];
    for (const surface of surfaces) {
      result.push(...parseSurfaceSnapshot(surface));
    }
    return result;
  }, [surfaces]);

  const {customSurfaces, standardSurfaces, skeletons} = useMemo(() => {
    const custom: ParsedSurface[] = [];
    const standard: ParsedSurface[] = [];
    const skel: ParsedSurface[] = [];

    for (const s of allParsed) {
      const props = s.componentProps as Record<string, unknown>;
      const isLoading =
        s.surfaceId.startsWith('skeleton-') || props.isLoading === true;

      if (isLoading && CUSTOM_COMPONENTS.has(s.componentType)) {
        skel.push(s);
      } else if (CUSTOM_COMPONENTS.has(s.componentType)) {
        custom.push(s);
      } else if (s.componentType) {
        standard.push(s);
      }
    }

    return {
      customSurfaces: custom,
      standardSurfaces: standard,
      skeletons: skel,
    };
  }, [allParsed]);

  if (
    customSurfaces.length === 0 &&
    standardSurfaces.length === 0 &&
    skeletons.length === 0
  ) {
    return null;
  }

  const realComponentTypes = new Set(
    customSurfaces.map((s) => s.componentType)
  );

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
      {skeletons
        .filter((s) => !realComponentTypes.has(s.componentType))
        .map((s) => (
          <A2UISkeleton key={s.surfaceId} componentType={s.componentType} />
        ))}
      {customSurfaces.map((surface) => (
        <CustomSurfaceComponent
          key={surface.surfaceId}
          surface={surface}
          allSurfaces={allParsed}
          onAction={onAction}
        />
      ))}
      {standardSurfaces.map((surface) => (
        <A2UIViewer
          key={surface.surfaceId}
          root={surface.rootId}
          components={surface.components}
          data={surface.data}
          onAction={handleA2UIAction}
        />
      ))}
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

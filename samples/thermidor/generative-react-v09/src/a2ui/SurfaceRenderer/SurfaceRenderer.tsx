import {useState, useEffect, useMemo, createContext} from 'react';
import {MessageProcessor, SurfaceGroupModel} from '@a2ui/web_core/v0_9';
import {A2uiSurface} from '@a2ui/react/v0_9';
import {customCatalog} from '../a2ui-catalog.js';
import styles from './SurfaceRenderer.module.css';

export interface SurfaceRendererProps {
  surfaces: Record<string, unknown>[];
  onAction?: (text: string, type: string) => void;
}

export const SurfaceGroupContext = createContext<SurfaceGroupModel<any> | null>(
  null
);

export function SurfaceRenderer({surfaces, onAction}: SurfaceRendererProps) {
  const processor = useMemo(() => {
    return new MessageProcessor([customCatalog], (action) => {
      const actionName = action.event?.name;
      const text = action.event?.context?.text;
      if (text) {
        onAction?.(text, actionName);
      }
    });
  }, [onAction]);

  const [activeSurfaces, setActiveSurfaces] = useState<any[]>([]);

  useEffect(() => {
    const updateSurfaces = () => {
      setActiveSurfaces(Array.from(processor.model.surfacesMap.values()));
    };

    const subCreated = processor.onSurfaceCreated(() => updateSurfaces());
    const subDeleted = processor.onSurfaceDeleted(() => updateSurfaces());

    updateSurfaces();

    return () => {
      subCreated.unsubscribe();
      subDeleted.unsubscribe();
    };
  }, [processor]);

  useEffect(() => {
    const messages = surfaces.flatMap((s) => (s.operations as any[]) || []);
    if (messages.length > 0) {
      processor.processMessages(messages);
    }
  }, [surfaces, processor]);

  // Exclude sub-surfaces that are rendered inline within BundleDisplay slots
  const rootSurfaces = useMemo(() => {
    return activeSurfaces.filter((s) => !s.id.startsWith('bundle-surface-'));
  }, [activeSurfaces]);

  if (rootSurfaces.length === 0) {
    return null;
  }

  return (
    <SurfaceGroupContext.Provider value={processor.model}>
      <div className={styles.container}>
        {rootSurfaces.map((surface) => (
          <A2uiSurface key={surface.id} surface={surface} />
        ))}
      </div>
    </SurfaceGroupContext.Provider>
  );
}

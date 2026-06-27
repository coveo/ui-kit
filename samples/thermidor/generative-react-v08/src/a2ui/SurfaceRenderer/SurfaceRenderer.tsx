import {useEffect} from 'react';
import {A2UIProvider, useA2UI, A2UIRenderer} from '@a2ui/react/v0_8';
import {registerA2UIV08Catalog} from '../a2ui-catalog.js';
import styles from '@samples/thermidor-shared-react/src/a2ui/SurfaceRenderer/SurfaceRenderer.module.css';

registerA2UIV08Catalog();

export interface SurfaceRendererProps {
  surfaces: Record<string, unknown>[];
  onAction?: (text: string, type: string) => void;
}

export function SurfaceRenderer({surfaces, onAction}: SurfaceRendererProps) {
  const handleA2UIAction = (event: any) => {
    const clientEvent = event.clientEvent || event;
    const actionName = clientEvent.actionName;
    const text = clientEvent.context?.text;
    if (text) {
      onAction?.(text, actionName);
    }
  };

  return (
    <A2UIProvider onAction={handleA2UIAction}>
      <SurfaceListInternal surfaces={surfaces} />
    </A2UIProvider>
  );
}

function SurfaceListInternal({
  surfaces,
}: {
  surfaces: Record<string, unknown>[];
}) {
  const {processMessages, getSurfaces} = useA2UI();

  useEffect(() => {
    const messages = surfaces.flatMap((s) => (s.operations as any[]) || []);
    processMessages(messages);
  }, [surfaces, processMessages]);

  const activeSurfaces = Array.from(getSurfaces().keys());

  if (activeSurfaces.length === 0) {
    return null;
  }

  return (
    <div className={styles.container}>
      {activeSurfaces.map((surfaceId) => (
        <A2UIRenderer key={surfaceId} surfaceId={surfaceId} />
      ))}
    </div>
  );
}

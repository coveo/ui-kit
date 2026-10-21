import {useId, useLayoutEffect, useRef, useState} from 'react';
import {useA2UI} from '@copilotkit/a2ui-renderer';
import type {ThermidorContract} from '@coveo/thermidor-schema/zod3';
import {useSession} from '../context/session.js';

type WellKnownSurfaceTemplate = (typeof ThermidorContract)['wellKnownSurfaces'][number];

/**
 * Creates an instance of a well-known surface template for as long as the calling component is
 * mounted, and feeds its messages, each one once, to the enclosing `A2UIProvider`. Returns the
 * instance's surface id once the renderer has its surface, or `null` before that.
 *
 * The instance is created in a layout effect, so the surface is drawn in the first paint. Its
 * renderer must be fed only this instance's messages: a renderer that clears and replays its
 * surfaces would remount the surface's components.
 */
export function useWellKnownSurface(template: WellKnownSurfaceTemplate): string | null {
  const session = useSession();
  const {processMessages} = useA2UI();
  const processMessagesRef = useRef(processMessages);
  processMessagesRef.current = processMessages;
  const surfaceId = `${template.template}-${useId()}`;
  const [createdSurfaceId, setCreatedSurfaceId] = useState<string | null>(null);

  useLayoutEffect(() => {
    const surface = session.createWellKnownSurface(template.template, {surfaceId});
    let fed = 0;
    const feed = () => {
      if (surface.messages.length > fed) {
        processMessagesRef.current([...surface.messages.slice(fed)]);
        fed = surface.messages.length;
      }
    };
    feed();
    const unsubscribe = session.subscribe(feed);
    setCreatedSurfaceId(surface.surfaceId);
    return () => {
      unsubscribe();
      surface.dispose();
      processMessagesRef.current([
        {version: 'v0.9', deleteSurface: {surfaceId: surface.surfaceId}},
      ]);
    };
  }, [session, template, surfaceId]);

  return createdSurfaceId;
}

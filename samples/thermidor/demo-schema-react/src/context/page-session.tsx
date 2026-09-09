import {createContext, useContext, useRef, type PropsWithChildren} from 'react';
import {GenerativeInterfaceProvider} from './generative-interface.js';

export type PageSessionMode = 'deterministic' | 'agentic';

interface PageSessionValue {
  readonly interfaceId: string;
  readonly surfaceType: string;
  readonly mode: PageSessionMode;
}

const PageSessionContext = createContext<PageSessionValue | null>(null);

function createInterfaceId(surfaceType: string) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `storefront-${surfaceType}-${suffix}`;
}

interface PageSessionProviderProps extends PropsWithChildren {
  surfaceType: string;
  mode: PageSessionMode;
}

/**
 * Owns a Thermidor interface for one routed page. The provider is mounted below the persistent
 * preview provider, so descendants can explicitly use both the page and preview sessions.
 */
export function PageSessionProvider({children, surfaceType, mode}: PageSessionProviderProps) {
  const interfaceIdRef = useRef(createInterfaceId(surfaceType));
  const valueRef = useRef<PageSessionValue>({
    interfaceId: interfaceIdRef.current,
    surfaceType,
    mode,
  });

  return (
    <PageSessionContext.Provider value={valueRef.current}>
      <GenerativeInterfaceProvider id={interfaceIdRef.current}>
        {children}
      </GenerativeInterfaceProvider>
    </PageSessionContext.Provider>
  );
}

export function usePageSession(): PageSessionValue {
  const session = useContext(PageSessionContext);
  if (!session) throw new Error('usePageSession must be used within a PageSessionProvider');
  return session;
}

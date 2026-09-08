import {createContext, useContext, useEffect, useRef, type PropsWithChildren} from 'react';
import {buildGenerativeUnifiedInterface, type GenerativeUnifiedInterface} from '@coveo/thermidor';
import {useEngine} from './engine.js';

const GenerativeInterfaceContext = createContext<GenerativeUnifiedInterface | null>(null);

export function GenerativeInterfaceProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceRef = useRef<GenerativeUnifiedInterface | null>(null);
  interfaceRef.current ??= buildGenerativeUnifiedInterface({engine});

  useEffect(() => {
    return () => interfaceRef.current?.dispose();
  }, []);

  return (
    <GenerativeInterfaceContext.Provider value={interfaceRef.current}>
      {children}
    </GenerativeInterfaceContext.Provider>
  );
}

export function useGenerativeInterface(): GenerativeUnifiedInterface {
  const generativeInterface = useContext(GenerativeInterfaceContext);
  if (!generativeInterface) {
    throw new Error('useGenerativeInterface must be used within a GenerativeInterfaceProvider');
  }
  return generativeInterface;
}

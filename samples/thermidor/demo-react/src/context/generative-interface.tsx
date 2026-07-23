import {
  createContext,
  useContext,
  useEffect,
  useRef,
  type PropsWithChildren,
} from 'react';
import {
  buildGenerativeInterface,
  type GenerativeInterface,
} from '@coveo/thermidor';
import {useEngine} from './engine.js';

const GenerativeInterfaceContext = createContext<GenerativeInterface | null>(
  null
);

export function GenerativeInterfaceProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceRef = useRef<GenerativeInterface | null>(null);
  interfaceRef.current ??= buildGenerativeInterface({engine});

  useEffect(() => {
    return () => interfaceRef.current?.dispose();
  }, []);

  return (
    <GenerativeInterfaceContext.Provider value={interfaceRef.current}>
      {children}
    </GenerativeInterfaceContext.Provider>
  );
}

export function useGenerativeInterface(): GenerativeInterface {
  const generativeInterface = useContext(GenerativeInterfaceContext);
  if (!generativeInterface) {
    throw new Error(
      'useGenerativeInterface must be used within a GenerativeInterfaceProvider'
    );
  }
  return generativeInterface;
}

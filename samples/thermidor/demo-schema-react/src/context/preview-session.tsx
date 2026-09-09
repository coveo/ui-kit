import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from 'react';
import {buildGenerativeUnifiedInterface, type GenerativeUnifiedInterface} from '@coveo/thermidor';
import {useEngine} from './engine.js';

export interface PreviewProduct {
  id: string;
  name: string;
  price: number;
  badge?: string;
}

export interface PreviewCartItem extends PreviewProduct {
  quantity: number;
}

interface PreviewSessionValue {
  readonly interface: GenerativeUnifiedInterface;
  readonly interfaceId: string;
  readonly query: string;
  readonly cart: PreviewCartItem[];
  readonly cartCount: number;
  readonly simulatedVisitor: boolean;
  setQuery(query: string): void;
  addToCart(product: PreviewProduct): void;
  removeFromCart(productId: string): void;
  toggleVisitorSimulation(): void;
}

const PreviewSessionContext = createContext<PreviewSessionValue | null>(null);

function createInterfaceId(prefix: string) {
  const suffix = globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2);
  return `${prefix}-${suffix}`;
}

/**
 * Long-lived session for the preview shell.
 *
 * The Thermidor interface is real and isolated from every page interface. Cart and query state
 * are kept in this adapter until the private preview contract can return their authoritative
 * state from Unified API.
 */
export function PreviewSessionProvider({children}: PropsWithChildren) {
  const engine = useEngine();
  const interfaceIdRef = useRef(createInterfaceId('storefront-preview'));
  const interfaceRef = useRef<GenerativeUnifiedInterface | null>(null);
  interfaceRef.current ??= buildGenerativeUnifiedInterface({
    engine,
    id: interfaceIdRef.current,
  });

  const [query, setQuery] = useState('');
  const [cart, setCart] = useState<PreviewCartItem[]>([]);
  const [simulatedVisitor, setSimulatedVisitor] = useState(false);

  useEffect(() => () => interfaceRef.current?.dispose(), []);

  const addToCart = useCallback((product: PreviewProduct) => {
    setCart((items) => {
      const existing = items.find((item) => item.id === product.id);
      if (!existing) return [...items, {...product, quantity: 1}];
      return items.map((item) =>
        item.id === product.id ? {...item, quantity: item.quantity + 1} : item
      );
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((items) => items.filter((item) => item.id !== productId));
  }, []);

  const toggleVisitorSimulation = useCallback(() => {
    setSimulatedVisitor((enabled) => !enabled);
  }, []);

  const cartCount = cart.reduce((total, item) => total + item.quantity, 0);

  const value = useMemo<PreviewSessionValue>(
    () => ({
      interface: interfaceRef.current!,
      interfaceId: interfaceIdRef.current,
      query,
      cart,
      cartCount,
      simulatedVisitor,
      setQuery,
      addToCart,
      removeFromCart,
      toggleVisitorSimulation,
    }),
    [addToCart, cart, cartCount, query, removeFromCart, simulatedVisitor, toggleVisitorSimulation]
  );

  return <PreviewSessionContext.Provider value={value}>{children}</PreviewSessionContext.Provider>;
}

export function usePreviewSession(): PreviewSessionValue {
  const session = useContext(PreviewSessionContext);
  if (!session) throw new Error('usePreviewSession must be used within a PreviewSessionProvider');
  return session;
}

export function useOptionalPreviewSession(): PreviewSessionValue | null {
  return useContext(PreviewSessionContext);
}

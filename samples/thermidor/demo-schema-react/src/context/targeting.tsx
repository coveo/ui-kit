import {createContext, useContext} from 'react';

export interface TargetedProduct {
  id: string;
  name: string;
  thumbnail?: string;
}

export interface TargetingContext {
  isTargeting: boolean;
  onProductTargeted: (productId: string, productName: string, productThumbnail?: string) => void;
  selectedProductIds: Set<string>;
}

const TargetingCtx = createContext<TargetingContext | null>(null);

export const TargetingProvider = TargetingCtx.Provider;

export function useTargeting(): TargetingContext | null {
  return useContext(TargetingCtx);
}

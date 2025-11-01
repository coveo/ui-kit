'use client';

import {createContext, type ReactNode, useContext} from 'react';
import type {Availability} from '@/lib/third-party-api-provider';

interface AvailabilityContextType {
  getAvailabilityPromise: (
    productId: string
  ) => Promise<Availability> | undefined;
}

const AvailabilityContext = createContext<AvailabilityContextType | undefined>(
  undefined
);

interface AvailabilityProviderProps {
  children: ReactNode;
  productIdToAvailabilityRequests: Map<string, Promise<Availability>>;
}

export function AvailabilityProvider({
  children,
  productIdToAvailabilityRequests,
}: AvailabilityProviderProps) {
  const getAvailabilityPromise = (
    productId: string
  ): Promise<Availability> | undefined => {
    return productIdToAvailabilityRequests.get(productId);
  };

  return (
    <AvailabilityContext.Provider value={{getAvailabilityPromise}}>
      {children}
    </AvailabilityContext.Provider>
  );
}

export function useAvailability() {
  const context = useContext(AvailabilityContext);
  if (context === undefined) {
    throw new Error(
      'useAvailability must be used within an AvailabilityProvider'
    );
  }
  return context;
}

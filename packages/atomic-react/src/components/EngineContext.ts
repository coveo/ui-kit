import {SearchEngine} from '@coveo/headless';
import {createContext} from 'react';

export interface EngineContextType {
  engine: SearchEngine;
}

export const EngineContext = createContext<Partial<EngineContextType>>({});

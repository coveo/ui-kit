import {ContextRoot, createContext} from '@lit/context';
import type {AnyBindings} from '../interface/bindings';

if (typeof window !== 'undefined') {
  const contextRoot = new ContextRoot();
  contextRoot.attach(document.body);
}

export const bindingsContext = createContext<AnyBindings>(Symbol('bindings'));

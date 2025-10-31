import {ContextRoot, createContext} from '@lit/context';
import type {AnyBindings} from '@/src/components';

if (typeof window !== 'undefined') {
  const contextRoot = new ContextRoot();
  contextRoot.attach(document.body);
}

export const bindingsContext = createContext<AnyBindings>(Symbol('bindings'));

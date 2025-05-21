import {AnyBindings} from '@/src/components';
import {createContext, ContextRoot} from '@lit/context';

if (typeof window !== 'undefined') {
  const contextRoot = new ContextRoot();
  contextRoot.attach(document.body);
}

export const bindingsContext = createContext<AnyBindings>(Symbol('bindings'));

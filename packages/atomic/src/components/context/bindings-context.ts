import {AnyBindings} from '@/src/components';
import {createContext} from '@lit/context';

export const bindingsContext = createContext<AnyBindings>(Symbol('bindings'));

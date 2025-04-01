import {
  CommerceEngine,
  CommerceEngineConfiguration,
} from '@coveo/headless/commerce';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {CommerceStore} from './store';

export type CommerceInitializationOptions = CommerceEngineConfiguration;
export type CommerceBindings = CommonBindings<
  CommerceEngine,
  CommerceStore,
  HTMLAtomicCommerceInterfaceElement
> &
  NonceBindings;

// TODO: KIT-3909: create commerce interface element

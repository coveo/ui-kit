import {SearchEngine} from '@coveo/headless';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {AtomicStore} from './store';

export type Bindings = CommonBindings<
  SearchEngine,
  AtomicStore,
  HTMLAtomicSearchInterfaceElement
> &
  NonceBindings;

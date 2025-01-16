import {SearchEngine} from '@coveo/headless';
import {CommonBindings, NonceBindings} from '../../common/interface/bindings';
import {SearchStore} from './store';

export type Bindings = CommonBindings<
  SearchEngine,
  SearchStore,
  HTMLAtomicSearchInterfaceElement
> &
  NonceBindings;

import type {SearchEngine} from '@coveo/headless';
import type {
  CommonBindings,
  NonceBindings,
} from '../../common/interface/bindings';
import type {AtomicSearchInterface} from './atomic-search-interface';
import type {SearchStore} from './store';

export type Bindings = CommonBindings<
  SearchEngine,
  SearchStore,
  AtomicSearchInterface
> &
  NonceBindings;

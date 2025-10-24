import type {RecommendationEngine} from '@coveo/headless/recommendation';
import type {CommonBindings} from '../../common/interface/bindings';
import type {RecsStore} from './store';

export type RecsBindings = CommonBindings<
  RecommendationEngine,
  RecsStore,
  HTMLAtomicRecsInterfaceElement
>;

import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {CommerceInterface, FacadeResolver, Facades} from '@/src/internal/utils/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';

const noopThunk = createNoopThunk('commerce-interface-noop');
const noopResolver: FacadeResolver = () => noopThunk;

const defaultResolvers: Record<Facades['commerce'], FacadeResolver> = {
  search: noopResolver,
  suggestions: noopResolver,
};

export class CommerceInterfaceImpl extends BaseInterface<'commerce'> implements CommerceInterface {
  constructor(
    engine: FullEngine,
    stateId: string,
    resolvers: Record<Facades['commerce'], FacadeResolver> = defaultResolvers
  ) {
    super(engine, stateId, 'commerce', resolvers);
  }
}

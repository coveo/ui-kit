import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  GenerativeInterface,
} from '@/src/internal/utils/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeSlice} from '@/src/internal/features/generative/index.js';

const noopThunk = createNoopThunk('generative');

const noopResolverFactory: FacadeResolverFactory = (_engine) => (_scope) => noopThunk;

const resolverFactories: Record<Facades['generative'], FacadeResolverFactory> = {
  conversation: noopResolverFactory,
};

export class GenerativeInterfaceImpl
  extends BaseInterface<'generative'>
  implements GenerativeInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'generative', resolverFactories);
    engine.adoptSlice(getOrCreateGenerativeSlice(this));
  }
}

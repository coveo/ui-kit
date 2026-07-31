import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  GenerativeUnifiedInterface,
} from '@/src/internal/utils/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeSlice} from '@/src/internal/features/generative/index.js';

const noopThunk = createNoopThunk('generativeUnified');

const noopResolverFactory: FacadeResolverFactory = (_engine) => (_scope) => noopThunk;

const resolverFactories: Record<Facades['generativeUnified'], FacadeResolverFactory> = {
  conversation: noopResolverFactory,
};

export class GenerativeUnifiedInterfaceImpl
  extends BaseInterface<'generativeUnified'>
  implements GenerativeUnifiedInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'generativeUnified', resolverFactories);
    engine.adoptSlice(getOrCreateGenerativeSlice(this));
  }
}

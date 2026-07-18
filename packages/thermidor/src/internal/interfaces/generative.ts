import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolver,
  Facades,
  GenerativeInterface,
} from '@/src/internal/utils/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeSlice} from '@/src/internal/features/generative/index.js';

const noopThunk = createNoopThunk('generative');

const noopResolver: FacadeResolver = (_iface) => noopThunk;

const resolvers: Record<Facades['generative'], FacadeResolver> = {
  conversation: noopResolver,
};

export class GenerativeInterfaceImpl
  extends BaseInterface<'generative'>
  implements GenerativeInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'generative', resolvers);
    engine.adoptSlice(getOrCreateGenerativeSlice(this));
  }
}

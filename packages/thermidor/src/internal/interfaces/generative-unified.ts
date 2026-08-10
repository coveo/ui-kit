import {BaseInterface} from '@/src/internal/utils/index.js';
import type {FullEngine} from '@/src/internal/engine/index.js';
import type {
  FacadeResolver,
  Facades,
  GenerativeUnifiedInterface,
} from '@/src/internal/utils/index.js';
import {createNoopThunk} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeSlice} from '@/src/internal/features/generative/index.js';

const noopThunk = createNoopThunk('generativeUnified');

const noopResolver: FacadeResolver = () => noopThunk;

const resolvers: Record<Facades['generativeUnified'], FacadeResolver> = {
  conversation: noopResolver,
};

export class GenerativeUnifiedInterfaceImpl
  extends BaseInterface<'generativeUnified'>
  implements GenerativeUnifiedInterface
{
  constructor(engine: FullEngine, stateId: string) {
    super(engine, stateId, 'generativeUnified', resolvers);
    engine.adoptSlice(getOrCreateGenerativeSlice(this));
  }
}

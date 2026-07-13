import {BaseInterface} from '@/src/internal/utils/index.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/internal/engine/index.js';
import type {
  FacadeResolverFactory,
  Facades,
  Supports,
} from '@/src/internal/utils/index.js';
import {generateId, createNoopThunk} from '@/src/internal/utils/index.js';
import {getOrCreateGenerativeSlice} from '@/src/internal/features/generative/index.js';

const noopThunk = createNoopThunk('generative');

const noopResolverFactory: FacadeResolverFactory = (_engine) => (_scope) =>
  noopThunk;

const resolverFactories: Record<Facades['generative'], FacadeResolverFactory> =
  {
    conversation: noopResolverFactory,
  };

export interface GenerativeInterface extends Supports<Facades['generative']> {}

export let getGenerativeSourceEngine: (iface: GenerativeInterface) => Engine;

export class GenerativeInterfaceImpl
  extends BaseInterface<'generative'>
  implements GenerativeInterface
{
  #sourceEngine: Engine;

  static {
    getGenerativeSourceEngine = <typeof getGenerativeSourceEngine>(
      ((iface: GenerativeInterfaceImpl) => iface.#sourceEngine)
    );
  }

  constructor(engine: FullEngine, stateId: string, sourceEngine: Engine) {
    super(engine, stateId, 'generative', resolverFactories);
    this.#sourceEngine = sourceEngine;
  }
}

export interface BuildGenerativeInterfaceOptions {
  engine: Engine;
  id?: string;
}

export function buildGenerativeInterface(
  options: BuildGenerativeInterfaceOptions
): GenerativeInterface {
  const fullEngine = getFullEngine(options.engine);
  const interfaceId = options.id ?? generateId();

  const iface = new GenerativeInterfaceImpl(
    fullEngine,
    interfaceId,
    options.engine
  );

  fullEngine.adoptSlice(getOrCreateGenerativeSlice(iface));

  return iface;
}

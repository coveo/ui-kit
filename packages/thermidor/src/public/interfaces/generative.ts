import {createAsyncThunk} from '@reduxjs/toolkit';
import {BaseInterface} from '@/src/core/interface/base-interface.js';
import {
  Engine,
  getFullEngine,
  type FullEngine,
} from '@/src/core/interface/engine/engine.js';
import type {
  FacadeResolverFactory,
  Facades,
} from '@/src/core/interface/utils/interface-types.js';
import {generateId} from '@/src/core/interface/utils/id-generator.js';
import {loadGenerative} from '@/src/core/interface/generative/generative-loader.js';

const noopThunk = createAsyncThunk<void, {engine: FullEngine}>(
  'generative/noop',
  async () => {}
);

const noopResolverFactory: FacadeResolverFactory = (_engine) => (_scope) =>
  noopThunk;

const resolverFactories: Record<Facades['generative'], FacadeResolverFactory> =
  {
    conversation: noopResolverFactory,
  };

export let getGenerativeSourceEngine: (iface: GenerativeInterface) => Engine;

export class GenerativeInterface extends BaseInterface<'generative'> {
  #sourceEngine: Engine;

  static {
    getGenerativeSourceEngine = (iface) => iface.#sourceEngine;
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

  loadGenerative(fullEngine, interfaceId);

  return new GenerativeInterface(fullEngine, interfaceId, options.engine);
}

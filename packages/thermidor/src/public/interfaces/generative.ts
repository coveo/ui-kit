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
import {SOURCE_ENGINE} from '@/src/core/interface/utils/symbols.js';
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

export class GenerativeInterface extends BaseInterface<'generative'> {
  readonly [SOURCE_ENGINE]: Engine;

  constructor(engine: FullEngine, stateId: string, sourceEngine: Engine) {
    super(engine, stateId, 'generative', resolverFactories);
    this[SOURCE_ENGINE] = sourceEngine;
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

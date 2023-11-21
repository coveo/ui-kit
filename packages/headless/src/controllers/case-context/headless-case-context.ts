import {CoreEngine} from '../../app/engine';
import {caseContextReducer as insightCaseContext} from '../../features/case-context/case-context-slice';
import {loadReducerError} from '../../utils/errors';
import {
  Context as CoreContext,
  ContextState as CoreContextState,
  ContextProps as CoreContextProps,
  buildContext as buildCoreContext,
} from '../context/headless-context';
import {buildInternalCoreContext} from '../core/context/headless-core-context';

export interface ContextProps extends CoreContextProps {}

/**
 * The `Context` controller exposes methods for managing the global context in a commerce interface.
 */
export interface CaseContext extends CoreContext {
  /**
   * Sets the case ID.
   * @param caseId - The new case ID.
   */
  setCaseId(caseId: string): void;

  /**
   * Sets the case number.
   * @param language - The new case number.
   */
  setCaseNumber(caseNumber: string): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Context` controller.
   */
  state: CaseContextState;
}

export interface CaseContextState extends CoreContextState {
  caseId: string;
  caseNumber: string;
}

export type CaseContextControllerState = CaseContext['state'];

/**
 * Mixin a `CaseContext` controller into an existing ContextController.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Context` properties.
 * @returns
 */
export const createCaseContext = (
  engine: CoreEngine,
  props: ContextProps
): CaseContext =>
  mixinCaseContext(engine, props, buildCoreContext(engine, props));

/**
 * Mixin a `CaseContext` controller into an existing ContextController.
 *
 * @param engine - The headless engine.
 * @param props - The configurable `Context` properties.
 * @param context - The context to mixin.
 * @returns A `CaseContext` controller instance.
 */
export function mixinCaseContext<InputContext extends CoreContext>(
  engine: CoreEngine,
  props: ContextProps,
  context: InputContext
): InputContext & CaseContext {
  if (!loadContextReducers(engine)) {
    throw loadReducerError;
  }

  if (!enhanceContext<InputContext>(context, engine)) {
    throw loadReducerError;
  }

  for (const [key, value] of Object.entries(props.initialState || {})) {
    context.add(key, value as string);
  }
  return context;
}

function enhanceContext<InputContext extends CoreContext>(
  context: InputContext,
  engine: CoreEngine
): context is InputContext & CaseContext {
  const {internalAddContext} = buildInternalCoreContext(engine);
  Object.assign(context, {
    setCaseId: (caseId: string) => internalAddContext('caseId', caseId),
    setCaseNumber: (caseNumber: string) =>
      internalAddContext('caseNumber', caseNumber),
  });
  return true;
}

function loadContextReducers(engine: CoreEngine): engine is CoreEngine {
  engine.addReducers({insightCaseContext});
  return true;
}

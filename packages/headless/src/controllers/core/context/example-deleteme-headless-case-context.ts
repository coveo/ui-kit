/**
 * This is an example of how to generate a strict context provider
 */
import type {CoreEngine} from '../../../app/engine.js';
import type {
  Context as CoreContext,
  ContextProps as CoreContextProps,
  ContextState as CoreContextState,
} from './headless-core-context.js';
import {buildInternalCoreContext} from './headless-core-internal-context.js';
import {generateStrictContextFunctions} from './headless-strict-context-factory.js';

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

export const {
  createCustomContext: createCaseContext,
  mixinCustomContext: mixinCaseContext,
} = generateStrictContextFunctions<CaseContext, ContextProps>(
  (engine: CoreEngine) => {
    const {add} = buildInternalCoreContext(engine);
    return {
      setCaseId: (caseId: string) => add('caseId', caseId),
      setCaseNumber: (caseNumber: string) => add('caseNumber', caseNumber),
    };
  }
);

import {CoreEngine} from '../../../app/engine.js';
import {caseContextReducer as insightCaseContext} from '../../../features/case-context/case-context-slice.js';
import {loadReducerError} from '../../../utils/errors.js';
import {
  Context as CoreContext,
  ContextProps as CoreContextProps,
  buildContext as buildCoreContext,
} from '../../context/headless-context.js';

type AdditionalProperties<AdditionalContext extends CoreContext> = Omit<
  AdditionalContext,
  keyof CoreContext
>;

/**
 * @internal
 * @param additionalPropertiesFactory - The functions that the strict context will have.
 * @returns Two functions to create and mixin the strict context.
 */
export const generateStrictContextFunctions = <
  AdditionalContext extends CoreContext,
  ContextProps extends CoreContextProps,
>(
  additionalPropertiesFactory: (
    engine: CoreEngine
  ) => AdditionalProperties<AdditionalContext>
) => {
  const mixinCustomContext = <InputContext extends CoreContext>(
    engine: CoreEngine,
    props: ContextProps,
    context: InputContext
  ): InputContext & AdditionalContext => {
    if (!loadContextReducers(engine)) {
      throw loadReducerError;
    }

    if (
      !enhanceContext<InputContext, AdditionalContext>(
        context,
        engine,
        additionalPropertiesFactory
      )
    ) {
      throw loadReducerError;
    }

    for (const [key, value] of Object.entries(props.initialState ?? {})) {
      context.add(key, value as string);
    }
    return context;
  };
  const createCustomContext = (
    engine: CoreEngine,
    props: ContextProps
  ): AdditionalContext =>
    mixinCustomContext(engine, props, buildCoreContext(engine, props));
  return {createCustomContext, mixinCustomContext};
};

function enhanceContext<
  InputContext extends CoreContext,
  AdditionalContext extends CoreContext,
>(
  context: InputContext,
  engine: CoreEngine,
  additionalPropertiesFactory: (
    engine: CoreEngine
  ) => AdditionalProperties<AdditionalContext>
): context is InputContext & AdditionalContext {
  Object.assign(context, additionalPropertiesFactory(engine));
  return true;
}

function loadContextReducers(engine: CoreEngine): engine is CoreEngine {
  engine.addReducers({insightCaseContext});
  return true;
}

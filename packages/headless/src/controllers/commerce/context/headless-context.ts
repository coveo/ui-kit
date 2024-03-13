import {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {
  setContext,
  setUser,
  setView,
} from '../../../features/commerce/context/context-actions';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';
import {contextSchema} from '../../../features/commerce/context/context-validation';
import {loadReducerError} from '../../../utils/errors';
import {validateOptions} from '../../../utils/validate-payload';
import {
  buildController,
  Controller,
} from '../../controller/headless-controller';

export interface ContextOptions {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  user?: User;
  view: View;
}

interface UserId {
  userId: string;
}

interface Email {
  email: string;
}

export type User = (UserId | Email | (UserId & Email)) & {
  userIp?: string;
  userAgent?: string;
};

export interface View {
  url: string;
  referrer?: string;
}

export interface ContextProps {
  /**
   * The initial options that should be applied to this `Context` controller.
   */
  options: ContextOptions;
}

/**
 * The `Context` controller exposes methods for managing the global context in a commerce interface.
 */
export interface Context extends Controller {
  /**
   * Sets the language.
   * @param language - The new language.
   */
  setLanguage(language: string): void;

  /**
   * Sets the country.
   * @param country - The new country.
   */
  setCountry(country: string): void;

  /**
   * Sets the currency.
   * @param currency - The new currency.
   */
  setCurrency(currency: CurrencyCodeISO4217): void;

  /**
   * Sets the user.
   * @param user - The new user.
   */
  setUser(user: User): void;

  /**
   * Sets the view.
   * @param view - The new view.
   */
  setView(view: View): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Context` controller.
   */
  state: ContextState;
}

export interface ContextState {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  user?: User;
  view: View;
}

export type ContextControllerState = Context['state'];

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Context` properties.
 * @returns A `Context` controller instance.
 */
export function buildContext(
  engine: CommerceEngine,
  props: ContextProps
): Context {
  if (!loadBaseContextReducers(engine)) {
    throw loadReducerError;
  }

  const controller = buildController(engine);
  const {dispatch} = engine;
  const getState = () => engine.state;

  const options = {
    ...props.options,
  };

  validateOptions(engine, contextSchema, options, 'buildContext');

  dispatch(
    setContext({
      ...options,
    })
  );

  return {
    ...controller,

    get state() {
      return getState().commerceContext;
    },

    setLanguage: (language: string) =>
      dispatch(
        setContext({
          ...getState().commerceContext,
          language,
        })
      ),

    setCountry: (country: string) =>
      dispatch(
        setContext({
          ...getState().commerceContext,
          country,
        })
      ),

    setCurrency: (currency: CurrencyCodeISO4217) =>
      dispatch(
        setContext({
          ...getState().commerceContext,
          currency,
        })
      ),

    setUser: (user: User) => dispatch(setUser(user)),

    setView: (view: View) => dispatch(setView(view)),
  };
}

function loadBaseContextReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceContext});
  return true;
}

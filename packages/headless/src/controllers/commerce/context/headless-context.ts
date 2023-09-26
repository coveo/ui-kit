import {RecordValue, Schema } from "@coveo/bueno";
import {nonEmptyString, requiredNonEmptyString, validateOptions} from '../../../utils/validate-payload';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {buildController, Controller} from '../../controller/headless-controller';
import {loadReducerError} from '../../../utils/errors';
import {
  setClientId,
  setContext,
  setCurrency,
  setLanguage,
  setTrackingId,
  setUser, setView
} from '../../../features/commerce/context/context-actions';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice';

const optionsSchema = new Schema({
  trackingId: requiredNonEmptyString,
  language: requiredNonEmptyString,
  currency: requiredNonEmptyString,
  clientId: requiredNonEmptyString,
  user: new RecordValue({
    values: {
      userId: nonEmptyString,
      email: nonEmptyString,
      userIp: nonEmptyString,
      userAgent: nonEmptyString,
    },
  }),
  view: new RecordValue({
    options: { required: true },
    values: {
      url: requiredNonEmptyString,
    }
  })
});

export interface ContextOptions {
  trackingId: string;
  language: string;
  currency: string;
  clientId: string;
  user?: User;
  view: View;
}

export interface User {
  userId?: string;
  email?: string;
  userIp?: string;
  userAgent?: string;
}

export interface View {
  url: string;
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
   * Sets the tracking ID.
   * @param trackingId - The new tracking ID.
   */
  setTrackingId(trackingId: string): void;

  /**
   * Sets the language.
   * @param language - The new language.
   */
  setLanguage(language: string): void;

  /**
   * Sets the currency.
   * @param currency - The new currency.
   */
  setCurrency(currency: string): void;

  /**
   * Sets the client ID.
   * @param clientId - The new client ID.
   */
  setClientId(clientId: string): void;

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
  trackingId?: string;
  language?: string;
  currency?: string;
  clientId?: string;
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

  validateOptions(engine, optionsSchema, options, 'buildContext');

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

    setTrackingId: (trackingId: string) => dispatch(setTrackingId(trackingId)),

    setLanguage: (language: string) => dispatch(setLanguage(language)),

    setCurrency: (currency: string) => dispatch(setCurrency(currency)),

    setClientId: (clientId: string) => dispatch(setClientId(clientId)),

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

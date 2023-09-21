import {RecordValue, Schema } from "@coveo/bueno";
import {nonEmptyString, validateOptions} from '../../../utils/validate-payload';
import {CommerceEngine} from '../../../app/commerce-engine/commerce-engine';
import {buildController, Controller} from '../../controller/headless-controller';
import {loadReducerError} from '../../../utils/errors';
import {setContext} from '../../../features/commerce/context/context-actions';
import {contextReducer as context} from '../../../features/commerce/context/context-slice';

const optionsSchema = new Schema({
  trackingId: nonEmptyString,
  language: nonEmptyString,
  currency: nonEmptyString,
  clientId: nonEmptyString,
  user: new RecordValue({
    values: {
      userId: nonEmptyString,
      email: nonEmptyString,
      userIp: nonEmptyString,
      userAgent: nonEmptyString,
    },
  }),
});

export interface ContextOptions {
  trackingId?: string;
  language?: string;
  currency?: string;
  clientId?: string;
  user?: User;
}

export interface User {
  userId?: string;
  email?: string;
  userIp?: string;
  userAgent?: string;
}

export interface ContextProps {
  /**
   * The initial options that should be applied to this `Context` controller.
   */
  options?: ContextOptions;
}

// TODO: Does this controller do too much? Should it expose sub-controllers which allow mutating
//  specific parts of the state?
/**
 * The `Context` controller allows the end user to configure context data.
 */
export interface Context extends Controller {
  /**
   * Sets the tracking id.
   * @param trackingId - The new tracking id.
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
   * Sets the client id.
   * @param clientId - The new client id.
   */
  setClientId(clientId: string): void;

  /**
   * Sets the user.
   * @param user - The new user.
   */
  setUser(user: User): void;

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
  user: User;
}

export type ContextControllerState = Context['state'];

/**
 * Creates a `ContextController` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `ContextController` properties.
 * @returns A `ContextController` controller instance.
 */
export function buildContext(
  engine: CommerceEngine,
  props: ContextProps = {}
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
      return getState().context;
    },

    setUrl: (url: string) =>
      dispatch(
        setProductListingUrl({
          url,
        })
      ),

    refresh: () => dispatch(fetchProductListing()),
  };
}

function loadBaseContextReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({context});
  return true;
}

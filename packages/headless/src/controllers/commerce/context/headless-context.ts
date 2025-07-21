import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {CommerceEngine} from '../../../app/commerce-engine/commerce-engine.js';
import {stateKey} from '../../../app/state-key.js';
import {
  setContext,
  setLocation,
  setView,
} from '../../../features/commerce/context/context-actions.js';
import {contextReducer as commerceContext} from '../../../features/commerce/context/context-slice.js';
import {contextSchema} from '../../../features/commerce/context/context-validation.js';
import {loadReducerError} from '../../../utils/errors.js';
import {validateOptions} from '../../../utils/validate-payload.js';
import {
  buildController,
  type Controller,
} from '../../controller/headless-controller.js';

export interface ContextOptions {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: View;
  location?: UserLocation;
}

export interface View {
  url: string;
}

export interface UserLocation {
  latitude: number;
  longitude: number;
}

export interface ContextProps {
  /**
   * The initial options that should be applied to this `Context` controller.
   */
  options?: ContextOptions;
}

/**
 * The `Context` controller exposes methods for managing the global context in a commerce interface.
 *
 * @group Buildable controllers
 * @category Context
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
   * Sets the view.
   * @param view - The new view.
   */
  setView(view: View): void;

  /**
   * Sets the location.
   * @param location - The new location.
   */
  setLocation(location: UserLocation): void;

  /**
   * A scoped and simplified part of the headless state that is relevant to the `Context` controller.
   */
  state: ContextState;
}

/**
 * The state of the `Context` controller.
 *
 * @group Buildable controllers
 * @category Context
 */
export interface ContextState {
  language: string;
  country: string;
  currency: CurrencyCodeISO4217;
  view: View;
  location?: UserLocation;
}

/**
 * Creates a `Context` controller instance.
 *
 * @param engine - The headless commerce engine.
 * @param props - The configurable `Context` properties.
 * @returns A `Context` controller instance.
 *
 * @group Buildable controllers
 * @category Context
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
  const getState = () => engine[stateKey];

  if (props.options) {
    validateOptions(engine, contextSchema, props.options, 'buildContext');
    dispatch(setContext(props.options));
  }

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

    setView: (view: View) => dispatch(setView(view)),

    setLocation: (location: UserLocation) => dispatch(setLocation(location)),
  };
}

function loadBaseContextReducers(
  engine: CommerceEngine
): engine is CommerceEngine {
  engine.addReducers({commerceContext});
  return true;
}

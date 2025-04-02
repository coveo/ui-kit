import {buildContext} from '@coveo/headless/commerce';
import {getEngine} from '../context/engine.js';

const engine = getEngine();

const contextController = buildContext(engine);

export function formatCurrency(price: number) {
  return new Intl.NumberFormat(
    `${contextController.state.language}-${contextController.state.language}`,
    {
      style: 'currency',
      currency: contextController.state.currency,
    }
  ).format(price);
}

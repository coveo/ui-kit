import type {CartItem} from '@coveo/headless-react/ssr-commerce';
import type {CurrencyCodeISO4217} from '@coveo/relay-event-types';
import type {ExternalCartItem} from '@/external-services/external-cart-service';

export const toCoveoCartItems = (items: ExternalCartItem[]): CartItem[] => {
  return items.map(toCoveoCartItem);
};

const toCoveoCartItem = (item: ExternalCartItem): CartItem => {
  return {
    productId: item.uniqueId,
    name: item.productName,
    price: item.pricePerUnit,
    quantity: item.totalQuantity,
  };
};

export const toCoveoCurrency = (currency: string): CurrencyCodeISO4217 => {
  return currency as CurrencyCodeISO4217;
};

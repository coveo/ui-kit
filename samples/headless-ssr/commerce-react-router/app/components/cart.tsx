import type {ExternalCartItem} from '@/external-services/external-cart-service';
import {formatCurrency} from '@/utils/format-utils';
import AddToCartButton from './add-to-cart-button.js';
import PurchaseButton from './purchase-button.js';
import RemoveFromCartButton from './remove-from-cart-button.js';

export default function Cart({
  items,
  totalPrice,
  language,
  currency,
}: {
  items: ExternalCartItem[];
  totalPrice: number;
  language: string;
  currency: string;
}) {
  return (
    <>
      {items === undefined || items.length === 0 ? (
        <p>Cart is empty</p>
      ) : (
        <>
          {items.map((item) => (
            <div key={item.uniqueId}>
              <h3>{item.productName}</h3>
              <p>
                Price: {formatCurrency(item.pricePerUnit, language, currency)}
              </p>
              <p>Quantity: {item.totalQuantity}</p>
              <AddToCartButton
                productId={item.uniqueId}
                name={item.productName}
                price={item.pricePerUnit}
              />
              <RemoveFromCartButton
                productId={item.uniqueId}
                name={item.productName}
                price={item.pricePerUnit}
              />
            </div>
          ))}
          <p>Total: {formatCurrency(totalPrice, language, currency)}</p>
          <PurchaseButton />
        </>
      )}
    </>
  );
}

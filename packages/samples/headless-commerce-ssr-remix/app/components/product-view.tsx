import {ExternalCartItem} from '@/external-services/external-cart-service';
import {ExternalCatalogItem} from '@/external-services/external-catalog-service';
import {useProductView} from '@/lib/commerce-engine';
import {formatCurrency} from '@/utils/format-currency';
import {useEffect, useRef} from 'react';
import AddToCartButton from './add-to-cart-button';
import RemoveFromCartButton from './remove-from-cart-button';

export default function ProductView({
  catalogItem,
  cartItem,
  language,
  currency,
}: {
  catalogItem: ExternalCatalogItem;
  cartItem: ExternalCartItem | null;
  language: string;
  currency: string;
}) {
  const {methods} = useProductView();

  const {
    productName: name,
    pricePerUnit: price,
    uniqueId: productId,
  } = catalogItem;

  const viewed = useRef(false);

  useEffect(() => {
    if (methods && !viewed.current) {
      viewed.current = true;
      methods.view({name, price, productId});
    }
  }, []);

  return (
    <>
      <h2>{name}</h2>
      <p>Price: {formatCurrency(price, language, currency)}</p>
      <AddToCartButton productId={productId} price={price} name={name} />
      {cartItem && (
        <>
          <RemoveFromCartButton
            productId={productId}
            price={price}
            name={name}
          />
          <p>In cart: {cartItem.totalQuantity}</p>
          <p>
            Total cost:{' '}
            {formatCurrency(
              cartItem.pricePerUnit * cartItem.totalQuantity,
              language,
              currency
            )}
          </p>
        </>
      )}
    </>
  );
}

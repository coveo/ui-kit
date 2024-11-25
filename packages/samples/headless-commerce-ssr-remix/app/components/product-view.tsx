import {ExternalCartItem} from '@/client/external-cart-api';
import {ExternalCatalogItem} from '@/client/external-catalog-api';
import {useProductView} from '@/lib/commerce-engine';
import {formatCurrency} from '@/utils/format-currency';
import {useEffect, useRef} from 'react';
import AddToCartButton from './add-to-cart-button';
import RemoveFromCartButton from './remove-from-cart-button';

interface ProductViewProps {
  catalogItem: ExternalCatalogItem;
  cartItem: ExternalCartItem | null;
  language: string;
  currency: string;
}

export default function ProductView({
  catalogItem,
  cartItem,
  language,
  currency,
}: ProductViewProps) {
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

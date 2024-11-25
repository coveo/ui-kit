import {ExternalCartItem} from '@/client/external-cart-api';
import {useCart} from '@/lib/commerce-engine';
import {useFetcher} from '@remix-run/react';
import {useEffect} from 'react';

type AddToCartButtonProps = {
  productId: string;
  price: number;
  name: string;
};

export default function AddToCartButton({
  productId,
  price,
  name,
}: AddToCartButtonProps) {
  const fetcher = useFetcher<ExternalCartItem>();
  const {methods} = useCart();

  useEffect(() => {
    if (fetcher.data === undefined || !methods) {
      return;
    }

    methods.updateItemQuantity({
      name: fetcher.data.productName,
      price: fetcher.data.pricePerUnit,
      productId: fetcher.data.uniqueId,
      quantity: fetcher.data.totalQuantity,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" action="/cart/add">
      <input type="hidden" name="productName" value={name} />
      <input type="hidden" name="pricePerUnit" value={price} />
      <input type="hidden" name="uniqueId" value={productId} />
      <button disabled={!methods || fetcher.state !== 'idle'}>
        Add one to cart
      </button>
    </fetcher.Form>
  );
}

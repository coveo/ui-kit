import {ExternalCartItem} from '@/external-services/external-cart-service';
import {useCart} from '@/lib/commerce-engine';
import {useFetcher} from '@remix-run/react';
import {useEffect} from 'react';

export default function RemoveFromCartButton({
  productId,
  price,
  name,
}: {
  productId: string;
  price: number;
  name: string;
}) {
  const fetcher = useFetcher<ExternalCartItem | null>();
  const {methods} = useCart();

  useEffect(() => {
    if (fetcher.data === undefined || !methods) {
      return;
    }

    if (fetcher.data === null) {
      methods.updateItemQuantity({productId, price, name, quantity: 0});
    } else {
      const {
        productName: name,
        pricePerUnit: price,
        uniqueId: productId,
        totalQuantity: quantity,
      } = fetcher.data;

      methods.updateItemQuantity({
        name,
        price,
        productId,
        quantity,
      });
    }
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" action="/cart/remove">
      <input type="hidden" name="uniqueId" value={productId} />
      <input type="hidden" name="pricePerUnit" value={price} />
      <input type="hidden" name="productName" value={name} />
      <button disabled={!methods || fetcher.state !== 'idle'}>
        Remove one from cart
      </button>
    </fetcher.Form>
  );
}

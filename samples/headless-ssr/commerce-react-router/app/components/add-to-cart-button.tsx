import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import type {ExternalCartItem} from '@/external-services/external-cart-service';
import {useCart} from '@/lib/commerce-engine';

export default function AddToCartButton({
  productId,
  price,
  name,
}: {
  productId: string;
  price: number;
  name: string;
}) {
  const fetcher = useFetcher<ExternalCartItem>();
  const {methods} = useCart();

  useEffect(() => {
    if (fetcher.data === undefined || !methods) {
      return;
    }

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
  }, [fetcher.data, methods]);

  return (
    <fetcher.Form method="post" action="/cart/add">
      <input type="hidden" name="productName" value={name} />
      <input type="hidden" name="pricePerUnit" value={price} />
      <input type="hidden" name="uniqueId" value={productId} />
      <button type="button" className="idle">
        Add one to cart
      </button>
    </fetcher.Form>
  );
}

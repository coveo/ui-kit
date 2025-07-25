import {useEffect} from 'react';
import {useFetcher} from 'react-router';
import type {ExternalCartPurchaseResponse} from '@/external-services/external-cart-service';
import {useCart} from '@/lib/commerce-engine';

export default function PurchaseButton() {
  const fetcher = useFetcher<ExternalCartPurchaseResponse>();
  const {methods} = useCart();

  useEffect(() => {
    if (fetcher.data === undefined || !methods) {
      return;
    }

    methods.purchase({
      id: fetcher.data.transactionId,
      revenue: fetcher.data.transactionRevenue,
    });
  }, [fetcher.data, methods]);

  return (
    <fetcher.Form method="post" action="/cart/purchase">
      <button type="button" disabled={!methods || fetcher.state !== 'idle'}>
        Purchase
      </button>
    </fetcher.Form>
  );
}

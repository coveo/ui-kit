import {ExternalCartPurchaseResponse} from '@/external-services/external-cart-service';
import {useCart} from '@/lib/commerce-engine';
import {useFetcher} from '@remix-run/react';
import {useEffect} from 'react';

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
  }, [fetcher.data]);

  return (
    <fetcher.Form method="post" action="/cart/purchase">
      <button disabled={!methods || fetcher.state !== 'idle'}>Purchase</button>
    </fetcher.Form>
  );
}

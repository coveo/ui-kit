export default async function ProductDescriptionPage({
  params,
}: {
  params: {productId: string};
}) {
  return <div>Product: {params.productId}</div>;
}

export const dynamic = 'force-dynamic';

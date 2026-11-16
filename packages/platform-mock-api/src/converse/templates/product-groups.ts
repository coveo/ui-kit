/** Lists the product first among its children, as producers do. */
function groupChildren<Child extends object>(
  product: Child,
  otherChildren: [Child, ...Child[]],
  totalNumberOfChildren = otherChildren.length + 1
): Child & {children: Child[]; totalNumberOfChildren: number} {
  return {...product, children: [product, ...otherChildren], totalNumberOfChildren};
}

interface StoreVariant {
  id: string;
  name: string;
  price: number;
  image: string;
}

/** The other products of a store product's group, named by their store variant title. */
function storeVariantsOf<Product extends object>(
  product: Product,
  variants: [StoreVariant, ...StoreVariant[]]
): [Product, ...Product[]] {
  const [first, ...rest] = variants.map(({id, name, price, image}) => ({
    ...product,
    permanentid: `gid://shopify/ProductVariant/${id}`,
    ec_name: name,
    ec_price: price,
    ec_images: [image],
    ec_thumbnails: [image],
  }));
  return [first, ...rest];
}

export {groupChildren, storeVariantsOf};

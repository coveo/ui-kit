/**
 * Lists a product's variants the way producers send them: the product itself first, then its
 * other variants, with the size of the whole group, which may count variants that are not listed.
 */
function groupVariants<Variant extends object>(
  product: Variant,
  otherVariants: Variant[],
  totalNumberOfChildren = otherVariants.length + 1
): Variant & {children: Variant[]; totalNumberOfChildren: number} {
  return {...product, children: [product, ...otherVariants], totalNumberOfChildren};
}

export {groupVariants};

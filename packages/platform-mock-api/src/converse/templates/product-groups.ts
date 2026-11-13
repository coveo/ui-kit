/**
 * Lists a product's children the way producers send them: the product itself first, then the
 * other products of its group, with the size of the whole group, which may count products that are
 * not listed.
 */
function groupChildren<Child extends object>(
  product: Child,
  otherChildren: Child[],
  totalNumberOfChildren = otherChildren.length + 1
): Child & {children: Child[]; totalNumberOfChildren: number} {
  return {...product, children: [product, ...otherChildren], totalNumberOfChildren};
}

export {groupChildren};

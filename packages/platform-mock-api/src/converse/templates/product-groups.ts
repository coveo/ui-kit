/**
 * Lists a product's children the way producers send them: the product itself first, then the
 * other products of its group, with how many of the group's products product grouping fetched, the
 * product included, which may be more than are listed.
 */
function groupChildren<Child extends object>(
  product: Child,
  otherChildren: Child[],
  totalNumberOfChildren = otherChildren.length + 1
): Child & {children: Child[]; totalNumberOfChildren: number} {
  return {...product, children: [product, ...otherChildren], totalNumberOfChildren};
}

export {groupChildren};

/** Lists the product first among its children, as producers do. */
function groupChildren<Child extends object>(
  product: Child,
  otherChildren: [Child, ...Child[]],
  totalNumberOfChildren = otherChildren.length + 1
): Child & {children: Child[]; totalNumberOfChildren: number} {
  return {...product, children: [product, ...otherChildren], totalNumberOfChildren};
}

export {groupChildren};

import {
  useA2UIComponent,
  type A2UIComponentProps,
  ComponentRegistry,
  A2UIRenderer,
} from '@a2ui/react/v0_8';
import {A2UIProductCard} from '@samples/thermidor-shared-react/src/a2ui/ProductCard/ProductCard.js';
import {A2UIProductCarousel} from '@samples/thermidor-shared-react/src/a2ui/ProductCarousel/ProductCarousel.js';
import {A2UIBundleDisplay} from '@samples/thermidor-shared-react/src/a2ui/BundleDisplay/BundleDisplay.js';
import {A2UINextActionsBar} from '@samples/thermidor-shared-react/src/a2ui/NextActionsBar/NextActionsBar.js';
import {A2UIComparisonTable} from '@samples/thermidor-shared-react/src/a2ui/ComparisonTable/ComparisonTable.js';
import {A2UIComparisonSummary} from '@samples/thermidor-shared-react/src/a2ui/ComparisonSummary/ComparisonSummary.js';

function usePropResolver(node: any, surfaceId: string) {
  const {resolveString, resolveNumber, getValue} = useA2UIComponent(
    node,
    surfaceId
  );

  const resolveProp = (
    propName: string,
    type: 'string' | 'number' = 'string'
  ) => {
    const propVal = (node.properties as any)?.[propName];
    if (propVal) {
      if (propVal.literalString !== undefined) return propVal.literalString;
      if (propVal.literalNumber !== undefined) return propVal.literalNumber;
      if (propVal.path) {
        const resolved =
          type === 'string' ? resolveString(propVal) : resolveNumber(propVal);
        if (resolved !== null && resolved !== undefined) return resolved;

        const items = getValue('/items') as any[];
        if (items && items[0]) {
          return items[0][propVal.path];
        }
      }
    }
    return undefined;
  };

  return {resolveProp, getValue};
}

export function A2UIProductCardNode({node, surfaceId}: A2UIComponentProps) {
  const {resolveProp} = usePropResolver(node, surfaceId);

  return (
    <A2UIProductCard
      ec_name={resolveProp('ec_name') as string | undefined}
      ec_brand={resolveProp('ec_brand') as string | undefined}
      ec_price={resolveProp('ec_price', 'number') as number | undefined}
      ec_image={resolveProp('ec_image') as string | undefined}
      ec_product_id={resolveProp('ec_product_id') as string | undefined}
      clickUri={resolveProp('clickUri') as string | undefined}
    />
  );
}

export function A2UIProductCarouselNode({node, surfaceId}: A2UIComponentProps) {
  const {resolveString, getValue} = useA2UIComponent(node, surfaceId);

  const heading = resolveString((node.properties as any).heading) ?? 'Products';
  const productsBinding = (node.properties as any).products;
  const items =
    (getValue(productsBinding?.dataBinding ?? '/items') as any[]) ?? [];

  return <A2UIProductCarousel heading={heading} items={items} />;
}

export function A2UIBundleDisplayNode({node, surfaceId}: A2UIComponentProps) {
  const {resolveString} = useA2UIComponent(node, surfaceId);

  const title = resolveString((node.properties as any).title) ?? 'Bundle';
  const bundles = ((node.properties as any).bundles as any[]) ?? [];

  return (
    <A2UIBundleDisplay
      title={title}
      bundles={bundles}
      renderSlot={(slot) => <A2UIRenderer surfaceId={slot.surfaceRef} />}
    />
  );
}

export function A2UINextActionsBarNode({node, surfaceId}: A2UIComponentProps) {
  const {getValue, sendAction} = useA2UIComponent(node, surfaceId);

  const actionsBinding = (node.properties as any).actions;
  const items =
    (getValue(actionsBinding?.dataBinding ?? '/actions') as any[]) ?? [];

  const handleActionClick = (text: string, type: string) => {
    sendAction({
      name: type || 'followup',
      context: {text},
    });
  };

  return <A2UINextActionsBar items={items} onAction={handleActionClick} />;
}

export function A2UIComparisonTableNode({node, surfaceId}: A2UIComponentProps) {
  const {resolveString, getValue} = useA2UIComponent(node, surfaceId);

  const heading =
    resolveString((node.properties as any).heading) ?? 'Comparison';
  const attributes = ((node.properties as any).attributes as string[]) ?? [
    'standout',
    'trade_off',
    'best_for',
  ];
  const itemsBinding = (node.properties as any).items;
  const items =
    (getValue(itemsBinding?.dataBinding ?? '/items') as any[]) ?? [];

  return (
    <A2UIComparisonTable
      heading={heading}
      attributes={attributes}
      items={items}
    />
  );
}

export function A2UIComparisonSummaryNode({
  node,
  surfaceId,
}: A2UIComponentProps) {
  const {resolveString} = useA2UIComponent(node, surfaceId);
  const text = resolveString((node.properties as any).text) ?? '';

  return <A2UIComparisonSummary text={text} />;
}

export function registerA2UIV08Catalog() {
  const registry = ComponentRegistry.getInstance();
  registry.register('ProductCard', {component: A2UIProductCardNode});
  registry.register('ProductCarousel', {component: A2UIProductCarouselNode});
  registry.register('BundleDisplay', {component: A2UIBundleDisplayNode});
  registry.register('NextActionsBar', {component: A2UINextActionsBarNode});
  registry.register('ComparisonTable', {component: A2UIComparisonTableNode});
  registry.register('ComparisonSummary', {
    component: A2UIComparisonSummaryNode,
  });
}

import {z} from 'zod';
import {useContext} from 'react';
import {CommonSchemas, Catalog} from '@a2ui/web_core/v0_9';
import {createComponentImplementation, A2uiSurface} from '@a2ui/react/v0_9';
import {A2UIProductCard} from '@samples/thermidor-shared-react/src/a2ui/ProductCard/ProductCard.js';
import {A2UIProductCarousel} from '@samples/thermidor-shared-react/src/a2ui/ProductCarousel/ProductCarousel.js';
import {A2UIBundleDisplay} from '@samples/thermidor-shared-react/src/a2ui/BundleDisplay/BundleDisplay.js';
import {A2UINextActionsBar} from '@samples/thermidor-shared-react/src/a2ui/NextActionsBar/NextActionsBar.js';
import {A2UIComparisonTable} from '@samples/thermidor-shared-react/src/a2ui/ComparisonTable/ComparisonTable.js';
import {A2UIComparisonSummary} from '@samples/thermidor-shared-react/src/a2ui/ComparisonSummary/ComparisonSummary.js';
import {SurfaceGroupContext} from './SurfaceRenderer/SurfaceRenderer.js';

export const ProductCardApi = {
  name: 'ProductCard',
  schema: z.object({
    ec_name: CommonSchemas.DynamicString.optional(),
    ec_brand: CommonSchemas.DynamicString.optional(),
    ec_price: CommonSchemas.DynamicNumber.optional(),
    ec_image: CommonSchemas.DynamicString.optional(),
    ec_product_id: CommonSchemas.DynamicString.optional(),
    clickUri: CommonSchemas.DynamicString.optional(),
  }),
};

export const ProductCarouselApi = {
  name: 'ProductCarousel',
  schema: z.object({
    heading: CommonSchemas.DynamicString.optional(),
    products: CommonSchemas.ChildList.optional(),
  }),
};

export const BundleDisplayApi = {
  name: 'BundleDisplay',
  schema: z.object({
    title: CommonSchemas.DynamicString.optional(),
    bundles: z.array(z.any()).optional(),
  }),
};

export const NextActionsBarApi = {
  name: 'NextActionsBar',
  schema: z.object({
    actions: CommonSchemas.ChildList.optional(),
  }),
};

export const ComparisonTableApi = {
  name: 'ComparisonTable',
  schema: z.object({
    heading: CommonSchemas.DynamicString.optional(),
    attributes: z.array(z.string()).optional(),
    items: CommonSchemas.ChildList.optional(),
  }),
};

export const ComparisonSummaryApi = {
  name: 'ComparisonSummary',
  schema: z.object({
    text: CommonSchemas.DynamicString.optional(),
  }),
};

export const ProductCardNode = createComponentImplementation(
  ProductCardApi,
  ({props, context}) => {
    const resolveProp = (propName: string, propVal: any) => {
      if (propVal !== undefined && propVal !== null) {
        return propVal;
      }
      const items = context.dataContext.dataModel.get('/items') as any[];
      if (items && items[0]) {
        return items[0][propName];
      }
      return undefined;
    };

    return (
      <A2UIProductCard
        ec_name={resolveProp('ec_name', props.ec_name) as string | undefined}
        ec_brand={resolveProp('ec_brand', props.ec_brand) as string | undefined}
        ec_price={resolveProp('ec_price', props.ec_price) as number | undefined}
        ec_image={resolveProp('ec_image', props.ec_image) as string | undefined}
        ec_product_id={
          resolveProp('ec_product_id', props.ec_product_id) as
            | string
            | undefined
        }
        clickUri={resolveProp('clickUri', props.clickUri) as string | undefined}
      />
    );
  }
);

export const ProductCarouselNode = createComponentImplementation(
  ProductCarouselApi,
  ({props, context}) => {
    const heading = props.heading ?? 'Products';

    const rawProps = context.componentModel.properties as any;
    const path =
      rawProps.products?.path || rawProps.products?.dataBinding || '/items';
    const items = (context.dataContext.dataModel.get(path) as any[]) ?? [];

    return <A2UIProductCarousel heading={heading} items={items} />;
  }
);

export const BundleDisplayNode = createComponentImplementation(
  BundleDisplayApi,
  ({props, context}) => {
    const title = props.title ?? 'Bundle';
    const bundles = props.bundles ?? [];
    const groupModel = useContext(SurfaceGroupContext);

    const renderSlot = (slot: any) => {
      if (!slot.surfaceRef) return null;
      const subSurface = groupModel?.getSurface(slot.surfaceRef);
      if (!subSurface) {
        return (
          <div style={{color: 'gray'}}>
            [Loading surface {slot.surfaceRef}...]
          </div>
        );
      }
      return <A2uiSurface surface={subSurface} />;
    };

    return (
      <A2UIBundleDisplay
        title={title}
        bundles={bundles}
        renderSlot={renderSlot}
      />
    );
  }
);

export const NextActionsBarNode = createComponentImplementation(
  NextActionsBarApi,
  ({props, context}) => {
    const rawProps = context.componentModel.properties as any;
    const path =
      rawProps.actions?.path || rawProps.actions?.dataBinding || '/actions';
    const items = (context.dataContext.dataModel.get(path) as any[]) ?? [];

    const handleActionClick = (text: string, type: string) => {
      context.dispatchAction({
        event: {
          name: type || 'followup',
          context: {text},
        },
      });
    };

    return <A2UINextActionsBar items={items} onAction={handleActionClick} />;
  }
);

export const ComparisonTableNode = createComponentImplementation(
  ComparisonTableApi,
  ({props, context}) => {
    const heading = props.heading ?? 'Comparison';
    const attributes = props.attributes ?? [
      'standout',
      'trade_off',
      'best_for',
    ];

    const rawProps = context.componentModel.properties as any;
    const path =
      rawProps.items?.path || rawProps.items?.dataBinding || '/items';
    const items = (context.dataContext.dataModel.get(path) as any[]) ?? [];

    return (
      <A2UIComparisonTable
        heading={heading}
        attributes={attributes}
        items={items}
      />
    );
  }
);

export const ComparisonSummaryNode = createComponentImplementation(
  ComparisonSummaryApi,
  ({props}) => {
    const text = props.text ?? '';
    return <A2UIComparisonSummary text={text} />;
  }
);

export const customCatalog = new Catalog('a2ui-surface', [
  ProductCardNode,
  ProductCarouselNode,
  BundleDisplayNode,
  NextActionsBarNode,
  ComparisonTableNode,
  ComparisonSummaryNode,
]);

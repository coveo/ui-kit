/*
 * This file is generated from the Thermidor A2-UI catalog and controller JSON Schemas.
 * Run `npm run generate:thermidor-contracts` in integration/thermidor-schema after changing the catalog.
 */
import {z} from 'zod';

const productCarouselControllersSchema = z
  .object({
    productListController: z
      .object({
        controllerId: z.string().min(1),
        controllerSchema: z.literal(
          'https://schema.thermidor.coveo.com/controllers/product-list.schema.json'
        ),
      })
      .strict(),
  })
  .strict();

export const productCarouselPropsSchema = z
  .object({
    controllers: productCarouselControllersSchema,
  })
  .strict();

const cartControllersSchema = z
  .object({
    cartController: z
      .object({
        controllerId: z.string().min(1),
        controllerSchema: z.literal(
          'https://schema.thermidor.coveo.com/controllers/cart.schema.json'
        ),
      })
      .strict(),
  })
  .strict();

export const cartPropsSchema = z
  .object({
    controllers: cartControllersSchema,
  })
  .strict();

export interface Product {
  permanentid: string;
  ec_name: string;
  ec_description?: string;
  ec_shortdesc?: string;
  ec_brand?: string;
  ec_category?: string[];
  ec_price?: number;
  ec_promo_price?: number;
  ec_images?: string[];
  ec_thumbnails?: string[];
  ec_in_stock?: boolean;
  ec_rating?: number | null;
  ec_color?: string;
  ec_item_group_id?: string;
  ec_item_group_name?: string;
  clickUri?: string;
  additionalFields: Record<string, unknown>;
  children?: Product[];
}

export const productSchema: z.ZodType<Product> = z.lazy(() =>
  z
    .object({
      permanentid: z.string(),
      ec_name: z.string(),
      ec_description: z.string().optional(),
      ec_shortdesc: z.string().optional(),
      ec_brand: z.string().optional(),
      ec_category: z.array(z.string()).optional(),
      ec_price: z.number().optional(),
      ec_promo_price: z.number().optional(),
      ec_images: z.array(z.string().url()).optional(),
      ec_thumbnails: z.array(z.string().url()).optional(),
      ec_in_stock: z.boolean().optional(),
      ec_rating: z.number().min(0).max(5).nullable().optional(),
      ec_color: z.string().optional(),
      ec_item_group_id: z.string().optional(),
      ec_item_group_name: z.string().optional(),
      clickUri: z.string().optional(),
      additionalFields: z.record(z.unknown()),
      children: z.array(productSchema).optional(),
    })
    .strict()
);

export const cartItemSchema = z
  .object({
    productId: z.string(),
    name: z.string(),
    price: z.number().gt(0),
    quantity: z.number().int().min(1),
  })
  .strict();

export type CartItem = z.infer<typeof cartItemSchema>;

export const productListControllerStateSchema = z
  .object({
    products: z.array(productSchema),
  })
  .strict();

export type ProductListControllerState = z.infer<typeof productListControllerStateSchema>;

export type ProductListController = z.infer<typeof productListControllerContract>;

export const productListControllerContract = z
  .object({
    schemaId: z.literal('https://schema.thermidor.coveo.com/controllers/product-list.schema.json'),
    state: productListControllerStateSchema,
  })
  .strict();

export const cartControllerStateSchema = z
  .object({
    items: z.array(cartItemSchema),
  })
  .strict();

export type CartControllerState = z.infer<typeof cartControllerStateSchema>;

export const cartControllerContractSetItemsPayloadSchema = z
  .object({
    items: z.array(cartItemSchema),
  })
  .strict();

export type SetItemsPayload = z.infer<typeof cartControllerContractSetItemsPayloadSchema>;

export const cartControllerContractUpdateItemQuantityPayloadSchema = z
  .object({
    item: cartItemSchema,
  })
  .strict();

export type UpdateItemQuantityPayload = z.infer<
  typeof cartControllerContractUpdateItemQuantityPayloadSchema
>;

export type CartController = z.infer<typeof cartControllerContract>;

export const cartControllerContract = z
  .object({
    schemaId: z.literal('https://schema.thermidor.coveo.com/controllers/cart.schema.json'),
    state: cartControllerStateSchema,
    setItems: cartControllerContractSetItemsPayloadSchema,
    updateItemQuantity: cartControllerContractUpdateItemQuantityPayloadSchema,
  })
  .strict();

export const controllerContracts = z.discriminatedUnion('schemaId', [
  productListControllerContract,
  cartControllerContract,
]);

export type ControllerContracts = z.infer<typeof controllerContracts>;

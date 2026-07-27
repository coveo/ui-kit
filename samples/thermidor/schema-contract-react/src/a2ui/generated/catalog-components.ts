/*
 * This file is generated from integration/thermidor-schema/a2-ui/catalog.json.
 * Run `npm run generate:sample-zod` in integration/thermidor-schema after changing the catalog.
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

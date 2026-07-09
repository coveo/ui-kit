export interface ProductListState {
  products: Product[];
}

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

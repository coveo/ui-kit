export interface Placement {
  callbackData: string;
  campaignId: string;
  visitorId: string;
}

export interface Badges extends Placement {
  badges: Badge[];
}

export interface Badge {
  id: string;
  message: string;
}

export interface Recommendations extends Placement {
  products: Product[];
}

export interface Product {
  additionalFields: string;
  childResults: Product[];
  clickUri: string;
  documentUri: string;
  ec_brand: string;
  ec_category: string;
  ec_cogs: string;
  ec_description: string;
  ec_images: string[];
  ec_in_stock: boolean;
  ec_item_group_id: string;
  ec_name: string;
  ec_price: number;
  ec_promo_price: number;
  ec_rating: number;
  ec_short_desc: string;
  ec_thumbnails: string[];
  permanentId: string;
  totalNumberOfChildResults: number;
}

import {StandardCommerceFields} from '../fields/fields-to-include';

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

export type Product = {
  [Field in typeof StandardCommerceFields[number]]: Field extends
    | 'ec_images'
    | 'ec_thumbnails'
    | 'foo'
    ? string[]
    : string;
} & {
  additionalFields: string;
  childResults: Product[];
  clickUri: string;
  documentUri: string;
  permanentId: string;
  totalNumberOfChildResults: number;
};

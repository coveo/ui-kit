export interface Badge {
  text: string;
  backgroundColor: string;
  textColor: string;
  iconUrl: string | null;
}

export interface BadgePlacement {
  placementId: string;
  badges: Badge[];
}

export interface BadgesProduct {
  productId: string;
  badgePlacements: BadgePlacement[];
}

export interface ProductEnrichmentSuccessBadgesResponse {
  products: BadgesProduct[];
}

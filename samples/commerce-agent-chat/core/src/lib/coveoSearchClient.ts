import type {CommerceConfig} from '../config/env.js';

export interface SearchResult {
  id: string;
  image: string;
  title: string;
  price: string;
}

export interface SearchResponse {
  results: SearchResult[];
  hasMore: boolean;
  totalCount: number;
}

/**
 * Modular Coveo Search client with pluggable endpoint handlers.
 * Current focus: Commerce Search API (Browse Products)
 * Future: Regular Search API, Faceted Navigation, etc.
 */
export class CoveoSearchClient {
  private readonly config: CommerceConfig;
  private readonly headers: Record<string, string>;
  private readonly platformUrl: string;
  private searchHub: string;

  constructor(config: CommerceConfig, searchHub = 'default') {
    this.config = config;
    this.searchHub = searchHub;
    this.platformUrl = this.normalizePlatformUrl(config.platformUrl);

    this.headers = {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Execute a direct Commerce Search API query.
   * Returns paginated product results.
   */
  async search(query: string, page: number = 0): Promise<SearchResponse> {
    if (!query.trim()) {
      return {
        results: [],
        hasMore: false,
        totalCount: 0,
      };
    }

    try {
      const language = this.config.language.trim();
      const country = this.config.country.trim();
      const currency = this.config.currency.trim();
      const trackingId = this.config.trackingId.trim();
      const clientId = this.config.clientId.trim();

      if (!language || !country || !currency || !trackingId || !clientId) {
        throw new Error(
          'Missing required search settings: language, country, currency, trackingId, or clientId'
        );
      }

      const offset = page * 10; // Page size of 10 results
      const count = 10;

      const payload = {
        query: query.trim(),
        language,
        country,
        currency,
        trackingId,
        clientId,
        tab: '',
        context: this.buildSearchContext(currency),
        offset,
        count,
      };

      const url = this.buildCommerceSearchUrl();
      const response = await fetch(url, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `HTTP ${response.status}: ${errorText || response.statusText}`
        );
      }

      const data = (await response.json()) as Record<string, unknown>;
      return this.parseCommerceSearchResponse(data, offset, count);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new Error(`Search failed: ${message}`);
    }
  }

  /**
   * Set a different search hub for future requests.
   * Allows switching between multiple search configurations.
   */
  setSearchHub(hub: string): void {
    this.searchHub = hub || 'default';
  }

  /**
   * Get current search hub.
   */
  getSearchHub(): string {
    return this.searchHub;
  }

  // ─────────────────────────────────────────────────────────
  // Private Helpers
  // ─────────────────────────────────────────────────────────

  private normalizePlatformUrl(url: string): string {
    return url.replace(/\/$/, '');
  }

  /**
   * Build Commerce Search API endpoint URL.
   * Pattern: {platformUrl}/rest/organizations/{orgId}/commerce/v2/search
   */
  private buildCommerceSearchUrl(): string {
    const {orgId} = this.config;
    return `${this.platformUrl}/rest/organizations/${orgId}/commerce/v2/search`;
  }

  /**
   * Build search context with commerce metadata.
   */
  private buildSearchContext(currency: string): Record<string, unknown> {
    return {
      currency,
      view: {
        url: this.config.contextUrl,
        referrer: '',
      },
      cart: [],
    };
  }

  /**
   * Parse Coveo Commerce Search API response into our SearchResult format.
   * Maps Coveo product data to minimal: { id, image, title, price }
   */
  private parseCommerceSearchResponse(
    data: Record<string, unknown>,
    offset: number,
    count: number
  ): SearchResponse {
    const results: SearchResult[] = [];
    const products =
      (Array.isArray(data.products)
        ? (data.products as Record<string, unknown>[])
        : undefined) ??
      (Array.isArray(data.results)
        ? (data.results as Record<string, unknown>[])
        : undefined);

    if (Array.isArray(products)) {
      for (const product of products) {
        const result = this.mapProductToSearchResult(product);
        if (result) {
          results.push(result);
        }
      }
    }

    const totalCount =
      typeof data.totalCount === 'number'
        ? data.totalCount
        : typeof data.total_count === 'number'
          ? data.total_count
          : results.length;
    const hasMore = offset + count < totalCount;

    return {
      results,
      hasMore,
      totalCount,
    };
  }

  /**
   * Map a Coveo product object to our SearchResult DTO.
   * Extracts: id, image (ec_image), title (ec_name), price (ec_price)
   */
  private mapProductToSearchResult(product: unknown): SearchResult | null {
    if (typeof product !== 'object' || product === null) {
      return null;
    }

    const p = product as Record<string, unknown>;

    // Extract fields from Coveo product metadata
    const id = String(
      p.ec_product_id || p.objectURI || p.uniqueid || p.permanentid || ''
    );
    const image = this.normalizeImageUrl(
      this.extractStringValue(
        p.ec_image,
        p.image,
        p.thumbnail,
        p.ec_thumbnail,
        p.ec_images,
        p.images,
        p.image_url,
        p.ec_image_url
      )
    );
    const title = String(p.ec_name || p.title || p.name || '');
    const price = String(
      p.ec_promo_price ?? p.ec_price ?? p.price ?? p.raw_price ?? ''
    );

    if (!id || !title) {
      return null; // Skip products missing essential fields
    }

    return {
      id,
      image,
      title,
      price,
    };
  }

  private extractStringValue(...values: unknown[]): string {
    for (const value of values) {
      const extracted = this.extractSingleStringValue(value);
      if (extracted) {
        return extracted;
      }
    }

    return '';
  }

  private extractSingleStringValue(value: unknown): string {
    if (typeof value === 'string') {
      return value.trim();
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        const extracted = this.extractSingleStringValue(entry);
        if (extracted) {
          return extracted;
        }
      }
      return '';
    }

    if (value && typeof value === 'object') {
      const record = value as Record<string, unknown>;
      return this.extractStringValue(
        record.url,
        record.href,
        record.value,
        record.src,
        record.default
      );
    }

    return '';
  }

  private normalizeImageUrl(imageUrl: string): string {
    if (!imageUrl) {
      return '';
    }

    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }

    if (imageUrl.startsWith('/')) {
      return `${this.platformUrl}${imageUrl}`;
    }

    return imageUrl;
  }

  // ─────────────────────────────────────────────────────────
  // Future Extension Points (Not Yet Implemented)
  // ─────────────────────────────────────────────────────────

  /**
   * [Future] Switch to regular Search API endpoint for non-commerce queries.
   * Would target: {platformUrl}/rest/search/v2
   */
  // private buildRegularSearchUrl(): string { ... }

  /**
   * [Future] Add faceted navigation support for filtering results.
   * Would include facet definitions in search request.
   */
  // async searchWithFacets(query: string, facets: FacetDefinition[]): Promise<SearchResponse> { ... }

  /**
   * [Future] Support multiple content types (not just commerce).
   * Would dispatch to appropriate endpoint handler.
   */
  // async advancedSearch(query: string, contentType: 'commerce' | 'regular'): Promise<SearchResponse> { ... }
}

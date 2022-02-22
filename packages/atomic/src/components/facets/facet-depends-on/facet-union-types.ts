import {Facet, CategoryFacet, NumericFacet, DateFacet} from '@coveo/headless';
import {CategoryFacetRequest} from '@coveo/headless/dist/definitions/features/facets/category-facet-set/interfaces/request';
import {FacetRequest} from '@coveo/headless/dist/definitions/features/facets/facet-set/interfaces/request';
import {DateFacetRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/date-facet-set/interfaces/request';
import {NumericFacetRequest} from '@coveo/headless/dist/definitions/features/facets/range-facets/numeric-facet-set/interfaces/request';

export type FacetRequestWithType =
  | {type: 'facets'; request: FacetRequest}
  | {
      type: 'categoryFacets';
      request: CategoryFacetRequest;
    }
  | {type: 'numericFacets'; request: NumericFacetRequest}
  | {type: 'dateFacets'; request: DateFacetRequest};

export type FacetWithType =
  | {type: 'facets'; facet: Facet; request: FacetRequest}
  | {
      type: 'categoryFacets';
      facet: CategoryFacet;
      request: CategoryFacetRequest;
    }
  | {type: 'numericFacets'; facet: NumericFacet; request: NumericFacetRequest}
  | {type: 'dateFacets'; facet: DateFacet; request: DateFacetRequest};

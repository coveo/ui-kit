import {Schema} from '@coveo/bueno';
import {
  facetId,
  field,
  numberOfValues,
} from '../../../core/facets/_common/facet-option-definitions';

export interface CommerceCategoryFacetOptions {
  /**
   * The field used to generate the facet.
   * */
  field: string;

  /**
   * A unique identifier for the controller. By default, a random unique ID is generated.
   * */
  facetId?: string;

  /**
   * The number of values to request for this facet. This option also determines the number of additional values to request each time this facet is expanded, as well as the number of values to display when this facet is collapsed.
   *
   * Minimum: `1`
   *
   * @defaultValue `5`
   */
  numberOfValues?: number;
}

export const commerceCategoryFacetOptionsSchema = new Schema<
  Required<CommerceCategoryFacetOptions>
>({
  field,
  facetId,
  numberOfValues,
});

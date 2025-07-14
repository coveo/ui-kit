import type {FacetValueFormat} from '../facets/facet-common-store';

export interface Breadcrumb {
  facetId: string;
  label: string;
  formattedValue: string[];
  state?: 'idle' | 'selected' | 'excluded';
  deselect: () => void;
  content?: ReturnType<NonNullable<FacetValueFormat<string>['content']>>;
}

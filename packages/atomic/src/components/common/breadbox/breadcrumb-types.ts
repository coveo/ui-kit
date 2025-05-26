export interface Breadcrumb {
  facetId: string;
  label: string;
  formattedValue: string[];
  state?: 'idle' | 'selected' | 'excluded';
  deselect: () => void;
}

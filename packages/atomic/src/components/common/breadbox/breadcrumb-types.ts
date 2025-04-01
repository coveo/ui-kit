import {VNode} from '@stencil/core';

export interface Breadcrumb {
  facetId: string;
  label: string;
  formattedValue: string[];
  state?: 'idle' | 'selected' | 'excluded';
  content?: VNode;
  deselect: () => void;
}

import type {Controller} from '../controller-types.js';
import type {
  Interface,
  Requires,
} from '@/src/core/interface/utils/interface-types.js';

export interface PaginationControllerState {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface PaginationController extends Controller {
  readonly state: PaginationControllerState;
  selectPage(page: number): void;
  setPageSize(pageSize: number): void;
}

export interface PaginationControllerOptions {
  interface: Interface & Requires<'search'>;
}

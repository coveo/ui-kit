import type {Controller} from '../controller-types.js';
import type {
  Interface,
  Requires,
} from '@/src/core/interface/utils/interface-types.js';

export interface ResultListControllerResult {
  uniqueId: string;
  title: string;
  uri: string;
  excerpt?: string;
  printableUri: string;
  clickUri: string;
  raw: Record<string, unknown>;
  score: number;
}

export interface ResultListControllerState {
  results: ResultListControllerResult[];
}

export interface ResultListController extends Controller {
  readonly state: ResultListControllerState;
}

export interface ResultListControllerOptions {
  interface: Interface & Requires<'search'>;
}

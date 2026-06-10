import type {Controller} from '@/src/public/controllers/controller-types.js';
import type {ControllerOptions} from '@/src/public/controllers/controller-types.js';

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

export interface ResultListControllerOptions extends ControllerOptions {}

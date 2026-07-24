import {BaseController} from '@/src/internal/utils/index.js';
import type {Supports} from '@/src/internal/utils/index.js';
import {createMemoizedStateSelector} from '@/src/internal/utils/index.js';
import {getHandleInternals} from '@/src/internal/utils/index.js';
import {getOrCreateResultsSelectors} from '@/src/internal/features/result-list/index.js';
import {getOrCreateResultsSlice} from '@/src/internal/features/result-list/index.js';
import type {Controller} from '@/src/public/controllers/controller-types.js';

class ResultListControllerImpl extends BaseController<ResultListControllerState> {
  constructor(options: ResultListControllerOptions) {
    const {engine} = getHandleInternals(options.interface);

    engine.adoptSlice(getOrCreateResultsSlice(options.interface));

    const selectors = getOrCreateResultsSelectors(options.interface);

    const controllerState = createMemoizedStateSelector(selectors.getResults, (results) => ({
      results: results.map((result) => ({
        uniqueId: result.uniqueId,
        title: result.title,
        uri: result.uri,
        excerpt: result.excerpt,
        printableUri: result.printableUri,
        clickUri: result.clickUri,
        raw: result.raw,
        score: result.score,
      })),
    }));

    super(engine, controllerState);
  }
}

export const buildResultListController = (
  options: ResultListControllerOptions
): ResultListController => new ResultListControllerImpl(options);

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

export interface ResultListController extends Controller<ResultListControllerState> {}

export interface ResultListControllerOptions {
  interface: Supports<'search'>;
}

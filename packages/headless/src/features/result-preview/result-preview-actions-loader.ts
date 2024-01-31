import {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import {HtmlRequestOptions} from '../../api/search/html/html-request';
import {CoreEngine} from '../../app/engine';
import {resultPreviewReducer as resultPreview} from '../../features/result-preview/result-preview-slice';
import {
  AsyncThunkGlobalOptions,
  fetchResultContent,
  FetchResultContentThunkReturn,
  UpdateContentURLThunkReturn,
  nextPreview,
  preparePreviewPagination,
  previousPreview,
  updateContentURL,
  UpdateContentURLOptions,
  PreparePreviewPaginationActionPayload,
} from './result-preview-actions';
import {StateNeededByHtmlEndpoint} from './result-preview-request-builder';

/**
 * The result preview action creators.
 */
export interface ResultPreviewActionCreators {
  /**
   * Fetch the content of a preview
   * @param opts
   * @returns A dispatchable action.
   */
  fetchResultContent(
    opts: HtmlRequestOptions
  ): AsyncThunkAction<
    FetchResultContentThunkReturn,
    HtmlRequestOptions,
    AsyncThunkGlobalOptions<StateNeededByHtmlEndpoint>
  >;

  /**
   * Compute and update the content URL for the result preview
   * @param opts
   * @returns A dispatchable action.
   */
  updateContentURL(
    opts: UpdateContentURLOptions
  ): AsyncThunkAction<
    UpdateContentURLThunkReturn,
    UpdateContentURLOptions,
    AsyncThunkGlobalOptions<StateNeededByHtmlEndpoint>
  >;

  /**
   * Update the position of the current result preview for pagination purposes.
   * @returns A dispatchable action.
   */
  nextPreview(): PayloadAction;

  /**
   * Update the position of the current result preview for pagination purposes.
   * @returns A dispatchable action.
   */
  previousPreview(): PayloadAction;

  preparePreviewPagination(
    payload: PreparePreviewPaginationActionPayload
  ): PayloadAction<PreparePreviewPaginationActionPayload>;
}

/**
 * Loads the `recommendation` reducer and returns possible action creators.
 *
 * @param engine - The headless engine.
 * @returns An object holding the action creators.
 */
export function loadResultPreviewActions(
  engine: CoreEngine
): ResultPreviewActionCreators {
  engine.addReducers({resultPreview});

  return {
    fetchResultContent,
    updateContentURL,
    nextPreview,
    previousPreview,
    preparePreviewPagination,
  };
}

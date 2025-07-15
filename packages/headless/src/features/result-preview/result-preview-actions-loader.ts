import type {AsyncThunkAction, PayloadAction} from '@reduxjs/toolkit';
import type {HtmlRequestOptions} from '../../api/search/html/html-request.js';
import type {CoreEngine} from '../../app/engine.js';
import {resultPreviewReducer as resultPreview} from '../../features/result-preview/result-preview-slice.js';
import {
  type AsyncThunkGlobalOptions,
  type FetchResultContentThunkReturn,
  fetchResultContent,
  nextPreview,
  type PreparePreviewPaginationActionPayload,
  preparePreviewPagination,
  previousPreview,
  type UpdateContentURLOptions,
  type UpdateContentURLThunkReturn,
  updateContentURL,
} from './result-preview-actions.js';
import type {StateNeededByHtmlEndpoint} from './result-preview-request-builder.js';

/**
 * The result preview action creators.
 *
 * @group Actions
 * @category ResultPreview
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
 *
 * @group Actions
 * @category ResultPreview
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

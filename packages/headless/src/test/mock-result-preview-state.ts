import type {ResultPreviewState} from '../features/result-preview/result-preview-state.js';

export function buildMockResultPreviewState(
  config: Partial<ResultPreviewState> = {}
): ResultPreviewState {
  return {
    content: '',
    uniqueId: '',
    isLoading: false,
    contentURL: '',
    position: -1,
    resultsWithPreview: [],
    ...config,
  };
}

import {ResultPreviewState} from '../features/result-preview/result-preview-state';

export function buildMockResultPreviewState(
  config: Partial<ResultPreviewState> = {}
): ResultPreviewState {
  return {
    content: '',
    uniqueId: '',
    isLoading: false,
    maximumFileSize: 50,
    ...config,
  };
}

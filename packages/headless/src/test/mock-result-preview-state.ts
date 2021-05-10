import {ResultPreviewState} from '../features/result-preview/result-preview-state';

export function buildMockResultPreviewState(
  config: Partial<ResultPreviewState> = {}
): ResultPreviewState {
  return {
    content: '',
    uniqueId: '',
    isLoading: false,
    maximumPreviewSize: 50,
    ...config,
  };
}

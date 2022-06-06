import {InsightInterface} from '../../api/service/insight/get-interface/get-interface-config-response';
import {InsightAPIErrorStatusResponse} from '../../api/service/insight/insight-api-client';

export const getInsightInterfaceInitialState = (): InsightInterfaceState => ({
  loading: false,
  config: undefined,
});

export interface InsightInterfaceState {
  loading: boolean;
  config?: {
    contextFields: Record<string, string>;
    interface?: InsightInterface;
  };
  error?: InsightAPIErrorStatusResponse;
}

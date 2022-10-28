import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {ReactNativeStorage} from './react-native-storage';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {PreprocessAnalyticsRequest} from '../client/analyticsRequestClient';
import {uuidv4} from '../client/crypto';
import {buildBaseUrl} from '../client/analytics';

export interface ReactNativeRuntimeOptions {
    visitorIdKey?: string;
    token?: string;
    version?: string;
    endpoint?: string;
    preprocessRequest?: PreprocessAnalyticsRequest;
}

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public client: AnalyticsFetchClient;

    constructor(options: ReactNativeRuntimeOptions, public storage: WebStorage = new ReactNativeStorage()) {
        const visitorIdKey = options.visitorIdKey ?? 'visitorIdKey';
        this.client = new AnalyticsFetchClient({
            preprocessRequest: options.preprocessRequest,
            token: options.token,
            baseUrl: buildBaseUrl(options.endpoint, options.version),
            visitorIdProvider: {
                getCurrentVisitorId: async () => (await this.storage.getItem(visitorIdKey)) || uuidv4(),
                setCurrentVisitorId: (visitorId: string) => this.storage.setItem(visitorIdKey, visitorId),
            },
        });
    }
}

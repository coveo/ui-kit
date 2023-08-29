import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {PreprocessAnalyticsRequest} from '../client/analyticsRequestClient';
import {v4 as uuidv4} from 'uuid';
import {buildBaseUrl} from '../client/analytics';

export type ReactNativeStorage = WebStorage;

export interface ReactNativeRuntimeOptions {
    /**
     * Mandatory Storage implementation.
     *
     * We recommend using a storage library. There are a few options presented in the readme: https://github.com/coveo/coveo.analytics.js#using-react-native
     */
    storage: ReactNativeStorage;
    /**
     * Key for storing the visitor ID value.
     * @defaut visitorId
     */
    visitorIdKey?: string;
    token?: string;
    version?: string;
    endpoint?: string;
    preprocessRequest?: PreprocessAnalyticsRequest;
}

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public client: AnalyticsFetchClient;
    public storage: ReactNativeStorage;

    constructor(options: ReactNativeRuntimeOptions) {
        const visitorIdKey = options.visitorIdKey ?? 'visitorId';
        this.storage = options.storage;
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

    public getClientDependingOnEventType() {
        return this.client;
    }
}

import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {PreprocessAnalyticsRequest} from '../client/analyticsRequestClient';
import {uuidv4} from '../client/crypto';
import {buildBaseUrl} from '../client/analytics';

export type ReactNativeStorage = WebStorage;

export interface ReactNativeRuntimeOptions {
    /**
     * Mandatory Storage implementation.
     *
     * It is recommended to use AsyncStorage from the "@react-native-async-storage/async-storage"
     * community package or the deprecated AsyncStorage from "react-native".
     * If you are using expo, you can also explore the "expo-secure-store" package.
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
}

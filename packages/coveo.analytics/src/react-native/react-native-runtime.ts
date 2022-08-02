import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {ReactNativeStorage} from './react-native-storage';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {IAnalyticsClientOptions} from '../client/analyticsRequestClient';

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public client: AnalyticsFetchClient;

    // TODO: v3 switch to ClientOptions type, add default options
    // TODO: v3 reuse own ReactNativeStorage to implement VisitorIdProvider's getCurrentVisitorId, setCurrentVisitorId
    constructor(clientOptions: IAnalyticsClientOptions) {
        this.storage = new ReactNativeStorage();
        this.client = new AnalyticsFetchClient(clientOptions);
    }
}

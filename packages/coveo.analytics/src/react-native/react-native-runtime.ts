import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {ReactNativeStorage} from './react-native-storage';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {IAnalyticsClientOptions} from '../client/analyticsRequestClient';

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public client: AnalyticsFetchClient;

    constructor(clientOptions: IAnalyticsClientOptions) {
        this.storage = new ReactNativeStorage();
        this.client = new AnalyticsFetchClient(clientOptions);
    }
}

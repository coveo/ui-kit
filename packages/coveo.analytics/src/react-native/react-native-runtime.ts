import {WebStorage} from '../storage';
import {AnalyticsFetchClient} from '../client/analyticsFetchClient';
import {ReactNativeStorage} from './react-native-storage';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';
import {IAnalyticsClientOptions} from '../client/analyticsRequestClient';

// TODO: improve usability & document use in major version bump
export class ReactNativeRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public client: AnalyticsFetchClient;

    constructor(clientOptions: IAnalyticsClientOptions) {
        this.storage = new ReactNativeStorage();
        this.client = new AnalyticsFetchClient(clientOptions);
    }
}

import {WebStorage} from '../storage';
import {AnalyticsFetchClient, IAnalyticsFetchClientOptions} from '../client/analyticsFetchClient';
import {ReactNativeStorage} from './react-native-storage';
import {IRuntimeEnvironment} from '../client/runtimeEnvironment';

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public beaconClient: AnalyticsFetchClient;

    constructor(beaconOptions: IAnalyticsFetchClientOptions) {
        this.storage = new ReactNativeStorage();
        this.beaconClient = new AnalyticsFetchClient(beaconOptions);
    }
}

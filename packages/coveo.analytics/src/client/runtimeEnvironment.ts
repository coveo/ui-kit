import {WebStorage, NullStorage, CookieAndLocalStorage, ReactNativeStorage} from '../storage';
import {AnalyticsBeaconClient, IAnalyticsBeaconClientOptions, NoopAnalyticsBeaconClient} from './analyticsBeaconClient';
import {hasLocalStorage, hasCookieStorage} from '../detector';
import {AnalyticsRequestClient} from './analyticsRequestClient';
import {AnalyticsFetchClient, IAnalyticsFetchClientOptions} from "./analyticsFetchClient";

export interface IRuntimeEnvironment {
    storage: WebStorage;
    beaconClient: AnalyticsRequestClient;
}

export class BrowserRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public beaconClient: AnalyticsBeaconClient;

    constructor(beaconOptions: IAnalyticsBeaconClientOptions, beforeUnload: () => void) {
        if (hasLocalStorage() && hasCookieStorage()) {
            this.storage = new CookieAndLocalStorage();
        } else if (hasLocalStorage()) {
            this.storage = localStorage;
        } else {
            console.warn('BrowserRuntime detected no valid storage available.', this);
            this.storage = new NullStorage();
        }

        this.beaconClient = new AnalyticsBeaconClient(beaconOptions);
        window.addEventListener('beforeunload', () => beforeUnload());
    }
}

export class NodeJSRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public beaconClient: AnalyticsFetchClient;

    constructor(beaconOptions: IAnalyticsBeaconClientOptions, storage: WebStorage) {
        this.storage = storage;
        this.beaconClient = new AnalyticsFetchClient(beaconOptions)
    }
}

export class ReactNativeRuntime implements IRuntimeEnvironment {
    public storage: WebStorage;
    public beaconClient: AnalyticsFetchClient;

    constructor(beaconOptions: IAnalyticsFetchClientOptions) {
        this.storage = new ReactNativeStorage()
        this.beaconClient = new AnalyticsFetchClient(beaconOptions);
    }

}

export class NoopRuntime implements IRuntimeEnvironment {
    public storage = new NullStorage();
    public beaconClient = new NoopAnalyticsBeaconClient();
}

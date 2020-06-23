import {WebStorage, NullStorage, CookieAndLocalStorage} from '../storage';
import {AnalyticsBeaconClient, IAnalyticsBeaconClientOptions, NoopAnalyticsBeaconClient} from './analyticsBeaconClient';
import {hasLocalStorage, hasCookieStorage} from '../detector';
import {AnalyticsRequestClient} from './analyticsRequestClient';

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
    public storage = new NullStorage();
    public beaconClient = new NoopAnalyticsBeaconClient();
}

export class NoopRuntime implements IRuntimeEnvironment {
    public storage = new NullStorage();
    public beaconClient = new NoopAnalyticsBeaconClient();
}

import {AnalyticsClient} from '../client/analytics';
import {v4 as uuidv4} from 'uuid';
import {getFormattedLocation} from '../client/location';
import {hasDocument} from '../detector';

type PluginWithId = {
    readonly Id: string;
};

export type PluginClass = typeof Plugin & PluginWithId;
export const BasePluginEventTypes = {
    pageview: 'pageview',
    event: 'event',
};

export type PluginOptions = {client: AnalyticsClient; uuidGenerator?: typeof uuidv4};

export abstract class Plugin {
    protected client: AnalyticsClient;
    protected uuidGenerator: typeof uuidv4;
    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        this.client = client;
        this.uuidGenerator = uuidGenerator;
    }
    public abstract getApi(name: string): any;
}

export abstract class BasePlugin extends Plugin {
    protected action?: string;
    protected actionData: {[name: string]: string} = {};
    private pageViewId: string;
    private nextPageViewId: string;
    private hasSentFirstPageView?: boolean;
    private currentLocation: string;
    private lastReferrer: string;

    constructor({client, uuidGenerator = uuidv4}: PluginOptions) {
        super({client, uuidGenerator});
        this.pageViewId = uuidGenerator();
        this.nextPageViewId = this.pageViewId;
        this.currentLocation = getFormattedLocation(window.location);
        this.lastReferrer = hasDocument() ? document.referrer : '';

        this.addHooks();
    }
    protected abstract addHooks(): void;
    protected abstract clearPluginData(): void;

    public getApi(name: string): Function | null {
        switch (name) {
            case 'setAction':
                return this.setAction;
            default:
                return null;
        }
    }

    public setAction(action: string, options?: any) {
        this.action = action;
        this.actionData = options;
    }

    public clearData() {
        this.clearPluginData();
        this.action = undefined;
        this.actionData = {};
    }

    public getLocationInformation(eventType: string, payload: any) {
        return {
            hitType: eventType,
            ...this.getNextValues(eventType, payload),
        };
    }

    protected updateLocationInformation(eventType: string, payload: any) {
        this.updateLocationForNextPageView(eventType, payload);
    }

    public getDefaultContextInformation(eventType: string) {
        const documentContext = {
            title: hasDocument() ? document.title : '',
            encoding: hasDocument() ? document.characterSet : 'UTF-8',
        };
        const screenContext = {
            screenResolution: `${screen.width}x${screen.height}`,
            screenColor: `${screen.colorDepth}-bit`,
        };
        const navigatorContext = {
            language: navigator.language,
            userAgent: navigator.userAgent,
        };
        const eventContext = {
            time: Date.now(),
            eventId: this.uuidGenerator(),
        };
        return {
            ...eventContext,
            ...screenContext,
            ...navigatorContext,
            ...documentContext,
        };
    }

    private updateLocationForNextPageView(eventType: string, payload: any) {
        const {pageViewId, referrer, location} = this.getNextValues(eventType, payload);

        this.lastReferrer = referrer;
        this.pageViewId = pageViewId;
        this.currentLocation = location;

        if (eventType === BasePluginEventTypes.pageview) {
            this.nextPageViewId = this.uuidGenerator();
            this.hasSentFirstPageView = true;
        }
    }

    /*
        When calling getPayload or getParameters, we need to return what would be sent by the API without updating our internal reference.
        For instance, if you getPayload("pageview"), we want to return the same payload as if you did coveoua("send", "pageview").
    */
    private getNextValues(eventType: string, payload: any) {
        /*
            When sending a pageview, we need to generate a new pageview ID.
            For instance, with the following sequence: 1. pageview, 2. event, 3. pageview, 4. event, 1 and 2 will have the pageviewid, whereas 3 and 4 will have a different pageviewid.
            We pre-generate the "nextPageViewId" in case you send the following sequence: 1. pageview, 2. event, 3. getPayload, 4. pageview. This ensures that 3 and 4 have the same pageviewid.
            We applied the same logic to the referrer and the location.
        */
        return {
            pageViewId: eventType === BasePluginEventTypes.pageview ? this.nextPageViewId : this.pageViewId,
            referrer:
                eventType === BasePluginEventTypes.pageview && this.hasSentFirstPageView
                    ? this.currentLocation
                    : this.lastReferrer,
            location:
                eventType === BasePluginEventTypes.pageview
                    ? this.getCurrentLocationFromPayload(payload)
                    : this.currentLocation,
        };
    }

    private getCurrentLocationFromPayload(payload: any) {
        if (!!payload.page) {
            const removeStartingSlash = (page: string) => page.replace(/^\/?(.*)$/, '/$1');
            const extractHostnamePart = (location: string) => location.split('/').slice(0, 3).join('/');
            return `${extractHostnamePart(this.currentLocation)}${removeStartingSlash(payload.page)}`;
        } else {
            return getFormattedLocation(window.location);
        }
    }
}

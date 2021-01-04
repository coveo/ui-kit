import {AnalyticsClient} from '../client/analytics';
import {uuidv4} from '../client/crypto';
import {getFormattedLocation} from '../client/location';

export const BasePluginEventTypes = {
    pageview: 'pageview',
    event: 'event',
};

export abstract class BasePlugin {
    protected client: AnalyticsClient;
    protected uuidGenerator: typeof uuidv4;
    protected action?: string;
    protected actionData: {[name: string]: string} = {};
    private pageViewId: string;
    private hasSentFirstPageView?: boolean;
    private lastLocation: string;
    private lastReferrer: string;

    constructor({client, uuidGenerator = uuidv4}: {client: AnalyticsClient; uuidGenerator?: typeof uuidv4}) {
        this.client = client;
        this.uuidGenerator = uuidGenerator;
        this.pageViewId = uuidGenerator();
        this.lastLocation = getFormattedLocation(window.location);
        this.lastReferrer = document.referrer;

        this.addHooks();
    }

    protected abstract addHooks(): void;
    protected abstract clearPluginData(): void;

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
        eventType === BasePluginEventTypes.pageview && this.updateStateForNewPageView(payload);
        return {
            referrer: this.lastReferrer,
            location: this.lastLocation,
        };
    }

    public getDefaultContextInformation(eventType: string) {
        const pageContext = {
            hitType: eventType,
            pageViewId: this.pageViewId,
        };
        const documentContext = {
            title: document.title,
            encoding: document.characterSet,
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
            time: Date.now().toString(),
            eventId: this.uuidGenerator(),
        };
        return {
            ...pageContext,
            ...eventContext,
            ...screenContext,
            ...navigatorContext,
            ...documentContext,
        };
    }

    private updateStateForNewPageView(payload: any) {
        if (this.hasSentFirstPageView) {
            this.pageViewId = this.uuidGenerator();
            this.lastReferrer = this.lastLocation;
        }

        if (!!payload.page) {
            const removeStartingSlash = (page: string) => page.replace(/^\/?(.*)$/, '/$1');
            const extractHostnamePart = (location: string) => location.split('/').slice(0, 3).join('/');
            this.lastLocation = `${extractHostnamePart(this.lastLocation)}${removeStartingSlash(payload.page)}`;
        } else {
            this.lastLocation = getFormattedLocation(window.location);
        }

        this.hasSentFirstPageView = true;
    }
}

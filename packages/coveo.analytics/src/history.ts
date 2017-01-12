import {WebStorage, getAvailableStorage, CookieStorage} from './storage';
import * as detector from './detector';

export const STORE_KEY: string = '__coveo.analytics.history';
export const MAX_NUMBER_OF_HISTORY_ELEMENTS: number = 20;
export const MIN_THRESHOLD_FOR_DUPLICATE_VALUE: number = 1000 * 60;
export const MAX_VALUE_SIZE = 75;

export class HistoryStore {
    private store: WebStorage;
    constructor(store?: WebStorage) {
        this.store = store || getAvailableStorage();
        // cleanup any old cookie that we might have added
        // eg : we used cookies before, but switched to local storage
        if (!(this.store instanceof CookieStorage) && detector.hasCookieStorage()) {
            new CookieStorage().removeItem(STORE_KEY);
        }
    };

    addElement(elem: HistoryElement) {
        elem.internalTime = new Date().getTime();
        this.cropQueryElement(elem);
        let currentHistory = this.getHistory();
        if (currentHistory != null) {
            if (this.isValidEntry(elem)) {
                this.setHistory([elem].concat(currentHistory));
            }

        } else {
            this.setHistory([elem]);
        }
    }

    getHistory(): HistoryElement[] {
        try {
            return <HistoryElement[]> JSON.parse(this.store.getItem(STORE_KEY));
        } catch (e) {
            // When using the Storage APIs (localStorage/sessionStorage)
            // Safari says that those APIs are available but throws when making
            // a call to them.
            return [];
        }
    }

    setHistory(history: HistoryElement[]) {
        try {
            this.store.setItem(STORE_KEY, JSON.stringify(history.slice(0, MAX_NUMBER_OF_HISTORY_ELEMENTS)));
        } catch (e) { /* refer to this.getHistory() */ }
    }

    clear() {
        try {
            this.store.removeItem(STORE_KEY);
        } catch (e) { /* refer to this.getHistory() */ }
    }

    getMostRecentElement(): HistoryElement {
        let currentHistory = this.getHistory();
        if (currentHistory != null) {
            const sorted = currentHistory.sort((first: HistoryElement, second: HistoryElement) => {
                // Internal time might not be set for all history element (on upgrade).
                // Ensure to return the most recent element for which we have a value for internalTime.
                if (first.internalTime == null && second.internalTime == null) {
                    return 0;
                }
                if (first.internalTime == null && second.internalTime != null) {
                    return 1;
                }
                if (first.internalTime != null && second.internalTime == null) {
                    return -1;
                }
                return second.internalTime - first.internalTime;
            });
            return sorted[0];
        }
        return null;
    }

    private cropQueryElement(elem: HistoryElement) {
        if (elem.name && elem.name.toLowerCase() == 'query' && elem.value != null) {
            elem.value = elem.value.slice(0, MAX_VALUE_SIZE);
        }
    }

    private isValidEntry(elem: HistoryElement): boolean {
        let lastEntry = this.getMostRecentElement();

        if (lastEntry && lastEntry.value == elem.value) {
            return elem.internalTime - lastEntry.internalTime > MIN_THRESHOLD_FOR_DUPLICATE_VALUE;
        }
        return true;
    }
}

export interface HistoryElement {
    name: string;
    value: string;
    time: string;
    internalTime?: number;
};

export interface HistoryViewElement extends HistoryElement {
    title?: string;
}

export default HistoryStore;

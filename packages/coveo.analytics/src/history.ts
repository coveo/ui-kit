import {WebStorage, getAvailableStorage} from './storage';

export const STORE_KEY: string = '__coveo.analytics.history';
export const MAX_NUMBER_OF_HISTORY_ELEMENTS: number = 20;

export class HistoryStore {
    private store: WebStorage;
    constructor(store?: WebStorage) {
        this.store = store || getAvailableStorage();
    };

    addElement(elem: HistoryElement) {
        if (this.getHistory() != null) {
            this.setHistory([elem].concat(this.getHistory()));
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
}

export interface HistoryElement {
    name: string;
    value: string;
    time: string;
};

export interface HistoryViewElement extends HistoryElement {
    title?: string;
}

export default HistoryStore;

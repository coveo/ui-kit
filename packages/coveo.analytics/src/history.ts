import * as detector from './detector';

const STORE_KEY: string = '__coveo.analytics.history';
const MAX_NUMBER_OF_HISTORY_ELEMENTS: number = 20;

function getAvailableStorage(): Storage {
    if (detector.hasSessionStorage) {
        return sessionStorage;
    }
    if (detector.hasLocalStorage) {
        return localStorage;
    }
    return new NullStorage();
}

class NullStorage implements Storage {
    length: number;
    constructor() { this.length = 0; }
    clear() {/**/}
    getItem(key: string): string { return ''; }
    key(index: number): string { return ''; }
    removeItem(key: string) {/**/}
    setItem(key: string, data: string): void {/**/}
    [key: string]: any;
    [index: number]: string;
}

export class HistoryStore {
    private store: Storage;
    constructor() {
        this.store = getAvailableStorage();
    };

    addElement(elem: HistoryElement) {
        this.setHistory([elem].concat(this.getHistory()));
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

export type HistoryElement =  HistoryViewElement | any;

export interface HistoryViewElement {
    type: string;
    uri: string;
    title?: string;
}

export default HistoryStore;

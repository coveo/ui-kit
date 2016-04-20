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
    return new NullStore();
}

class NullStore implements Storage {
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
        } catch (e) { /*prevent safari porn mode crash*/ return []; }
    }

    setHistory(history: HistoryElement[]) {
        try {
            this.store.setItem(STORE_KEY, JSON.stringify(history.slice(0, MAX_NUMBER_OF_HISTORY_ELEMENTS)));
        } catch (e) { /*prevent safari porn mode crash*/ }
    }

    clear() {
        try {
            this.store.removeItem(STORE_KEY);
        } catch (e) { /*prevent safari porn mode crash*/ }
    }
}

export interface HistoryElement {
    type: string;
    uri: string;
    title?: string;
}

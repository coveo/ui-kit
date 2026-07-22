import * as history from './history';
import {MAX_NUMBER_OF_HISTORY_ELEMENTS} from './history';
import {WebStorage} from './storage';

describe('history', () => {
    let storageMock: jest.Mocked<WebStorage>;
    let historyStore: history.HistoryStore;
    let data: history.HistoryElement;

    beforeEach(() => {
        let storageData: any;
        storageMock = {
            getItem: jest.fn((key) => storageData),
            setItem: jest.fn((key, data) => {
                storageData = data;
            }),
            removeItem: jest.fn(),
        };
        historyStore = new history.HistoryStore(storageMock);
        data = {
            name: 'name',
            value: 'value',
            time: new Date().toISOString(),
        };
    });

    it('should return the same an element after adding it to the history', () => {
        historyStore.addElement(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        const [setKey, setData] = storageMock.setItem.mock.calls[0];

        expect(setKey).toBe(history.STORE_KEY);
        expect(setData).toMatch(/"value":"value"/);
        expect(setData).toMatch(/"time"/);
        expect(setData).toMatch(/"internalTime"/);
    });

    it('should return the same an element after adding it to the history', async () => {
        await historyStore.addElementAsync(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        const [setKey, setData] = storageMock.setItem.mock.calls[0];

        expect(setKey).toBe(history.STORE_KEY);
        expect(setData).toMatch(/"value":"value"/);
        expect(setData).toMatch(/"time"/);
        expect(setData).toMatch(/"internalTime"/);
    });

    it('should trim query over > 75 char', async () => {
        data.value = '';
        let newValue = '';
        for (let i = 0; i < 100; i++) {
            newValue += i.toString();
        }
        data.name = 'Query';
        data.value = newValue;

        await historyStore.addElementAsync(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        const [setKey, setData] = storageMock.setItem.mock.calls[0];

        expect(setKey).toBe(history.STORE_KEY);
        expect(setData).toMatch(/"value":"01234[0-9]{70}"/);
    });

    it("should not trim elements over 75 char if it's not a query", async () => {
        data.value = '';
        let newValue = '';
        for (let i = 0; i < 100; i++) {
            newValue += i.toString();
        }
        data.name = 'Not A Query';
        data.value = newValue;

        await historyStore.addElementAsync(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
        const [setKey, setData] = storageMock.setItem.mock.calls[0];

        expect(setKey).toBe(history.STORE_KEY);
        expect(setData).toMatch(/"value":"01234[0-9]{185}"/);
    });

    it('should not keep more then MAX_ELEMENTS', async () => {
        for (let i = 0; i < MAX_NUMBER_OF_HISTORY_ELEMENTS + 5; i++) {
            data.value = i.toString();
            await historyStore.addElementAsync(data);
        }
        const history = await historyStore.getHistoryAsync();
        expect(history.length).toBe(MAX_NUMBER_OF_HISTORY_ELEMENTS);
    });

    it('should be able to remove all internalTime', () => {
        const historyElements: history.HistoryElement[] = [];
        for (let i = 0; i < 5; i++) {
            historyElements.push({
                name: 'name' + i,
                value: 'value' + i,
                time: new Date().toISOString(),
                internalTime: new Date().getTime(),
            });
        }

        for (let elem of historyElements) {
            expect(elem).toHaveProperty('internalTime');
        }

        const stripedHistoryElements = historyStore['stripInternalTime'](historyElements);

        for (let elem of stripedHistoryElements) {
            expect(elem).not.toHaveProperty('internalTime');
        }
    });

    it('should strip empty query values when calling getHistoryAsync', async () => {
        data.name = 'Query';
        data.value = '';
        const historyElements: history.HistoryElement[] = [data];
        historyStore.setHistory(historyElements);

        const history = await historyStore.getHistoryAsync();
        expect(history[0].value).toBeUndefined();
    });

    it('should strip empty query values when calling getHistory', () => {
        data.name = 'Query';
        data.value = '';
        const historyElements: history.HistoryElement[] = [data];
        historyStore.setHistory(historyElements);

        const history = historyStore.getHistory();
        expect(history[0].value).toBeUndefined();
    });

    it('should strip empty query from new element (addElement)', () => {
        data.name = 'Query';
        data.value = '';
        historyStore.addElement(data);

        const [_, setData] = storageMock.setItem.mock.calls[0];
        expect(setData).not.toMatch(/"value"/);
    });

    it('should strip empty query from new element (addElementAsync)', async () => {
        data.name = 'Query';
        data.value = '';
        await historyStore.addElementAsync(data);

        const [_, setData] = storageMock.setItem.mock.calls[0];
        expect(setData).not.toMatch(/"value"/);
    });

    it('should remove item when cleared', () => {
        historyStore.clear();

        expect(storageMock.removeItem).toHaveBeenCalledWith(history.STORE_KEY);
    });

    it('should be able to set the history', () => {
        const historyElements: history.HistoryElement[] = [data];

        historyStore.setHistory(historyElements);

        expect(storageMock.setItem).toHaveBeenCalledWith(
            history.STORE_KEY,
            expect.stringContaining(JSON.stringify(historyElements))
        );
    });

    it('should reject consecutive duplicate values', async () => {
        await historyStore.addElementAsync(data);
        await historyStore.addElementAsync(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(1);
    });

    it('should accept consecutive values which are not duplicates', async () => {
        await historyStore.addElementAsync(data);
        data.value = 'something else';
        await historyStore.addElementAsync(data);

        expect(storageMock.setItem).toHaveBeenCalledTimes(2);
    });

    it('should not throw when the content of localStorage is not an array', async () => {
        storageMock.setItem(history.STORE_KEY, '{"foo":"bar"}');
        let ex: any;
        try {
            const mostRecentElement = await historyStore.getMostRecentElement();
            expect(mostRecentElement).toBeNull();
            const localHistory = await historyStore.getHistoryAsync();
            expect(localHistory).toStrictEqual([]);
        } catch (err) {
            ex = err;
        }
        expect(ex).toBeUndefined();
    });
});

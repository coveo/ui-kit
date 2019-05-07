import * as history from './history';
import * as sinon from 'sinon';
import test from 'ava';
import { MAX_NUMBER_OF_HISTORY_ELEMENTS } from './history';
import { NullStorage, WebStorage } from './storage';

let storage: WebStorage;
let storageMock: sinon.SinonMock;
let historyStore: history.HistoryStore;
let data: history.HistoryElement;

test.beforeEach(t => {
    storage = new NullStorage();
    storageMock = sinon.mock(storage);
    historyStore = new history.HistoryStore(storage);
    data = {
        name: 'name',
        value: 'value',
        time: JSON.stringify(new Date())
    };
});

test.afterEach(t => {
    storage = null;
    storageMock = null;
    historyStore = null;
    data = null;
});

test('HistoryStore should be able to add an element in the history', t => {
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"value"/).and(sinon.match(/"time"/)).and(sinon.match(/"internalTime"/)));
    historyStore.addElement(data);
    storageMock.verify();
});

test('History store should trim query over > 75 char', t => {
    data.value = '';
    let newValue = '';
    for (var i = 0; i < 100; i++) {
        newValue += i.toString();
    }
    data.name = 'Query';
    data.value = newValue;
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"01234[0-9]{70}"/));
    historyStore.addElement(data);
    storageMock.verify();
});

test('History store should not trim elements over 75 char if it\'s not a query', t => {
    data.value = '';
    let newValue = '';
    for (var i = 0; i < 100; i++) {
        newValue += i.toString();
    }
    data.name = 'Not A Query';
    data.value = newValue;
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"01234[0-9]{185}"/));
    historyStore.addElement(data);
    storageMock.verify();
});

test('History store should not keep more then MAX_ELEMENTS', t => {
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"0"/));
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"5"/));
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"9"/));
    storageMock.expects('setItem').never().withArgs(history.STORE_KEY, sinon.match(/"value":"10"/));
    for (var i = 0; i < MAX_NUMBER_OF_HISTORY_ELEMENTS + 1; i++) {
        data.value = i.toString();
        historyStore.addElement(data);
    }
    storageMock.verify();

});

test('HistoryStore should be able to get the history', t => {
    storageMock.expects('getItem').once().withArgs(history.STORE_KEY);
    historyStore.getHistory();
    storageMock.verify();
});

test('HistoryStore should be able to remove all internalTime', t => {
    var historyElements: history.HistoryElement[] = [];
    for (var i = 0; i < 5; i++) {
        historyElements.push({
            name: 'name' + i,
            value: 'value' + i,
            time: JSON.stringify(new Date()),
            internalTime: new Date().getTime()
        });
    }

    for (let elem of historyElements) {
        t.true(elem.hasOwnProperty('internalTime'));
    }

    const stripedHistoryElements = historyStore['stripInternalTime'](historyElements);

    for (let elem of stripedHistoryElements) {
        t.false(elem.hasOwnProperty('internalTime'));
    }
});

test('HistoryStore should remove item when cleared', t => {
    storageMock.expects('removeItem').once().withArgs(history.STORE_KEY);
    historyStore.clear();
    storageMock.verify();
});

test('HistoryStore should be able to set the history', t => {
    var historyElements: history.HistoryElement[] = [data];
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, JSON.stringify(historyElements));
    historyStore.setHistory(historyElements);
    storageMock.verify();
});

test('History store should reject consecutive duplicate values', t => {
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"value"/));
    historyStore.addElement(data);
    historyStore.addElement(data);
    storageMock.verify();
});

test('History store should accept consecutive values which are not duplicates', t => {
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"value"/));
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"something else"/));
    historyStore.addElement(data);
    data.value = 'something else';
    historyStore.addElement(data);
    storageMock.verify();
});

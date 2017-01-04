import test from 'ava';
import * as sinon from 'sinon';
import {NullStorage, WebStorage} from '../src/storage';
import * as history from '../src/history';
import {MAX_NUMBER_OF_HISTORY_ELEMENTS} from '../src/history';

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

test.afterEach( t => {
  storage = null;
  storageMock = null;
  historyStore = null;
  data = null;
});

test('HistoryStore should be able to add an element in the history', t => {
  storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"value"/));
  historyStore.addElement(data);
  storageMock.verify();
});

test('History store should trim value over > 75 char', t => {
    data.value = '';
    let newValue = '';
    for (var i = 0; i < 100; i++) {
        newValue += i.toString();
    }
    data.value = newValue;
    storageMock.expects('setItem').once().withArgs(history.STORE_KEY, sinon.match(/"value":"01234[0-9]{70}"/));
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

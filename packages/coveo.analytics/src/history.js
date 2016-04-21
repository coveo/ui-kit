"use strict";
var detector = require('./detector');
var STORE_KEY = '__coveo.analytics.history';
var MAX_NUMBER_OF_HISTORY_ELEMENTS = 20;
function getAvailableStorage() {
    if (detector.hasSessionStorage) {
        return sessionStorage;
    }
    if (detector.hasLocalStorage) {
        return localStorage;
    }
    return new NullStorage();
}
var NullStorage = (function () {
    function NullStorage() {
        this.length = 0;
    }
    NullStorage.prototype.clear = function () { };
    NullStorage.prototype.getItem = function (key) { return ''; };
    NullStorage.prototype.key = function (index) { return ''; };
    NullStorage.prototype.removeItem = function (key) { };
    NullStorage.prototype.setItem = function (key, data) { };
    return NullStorage;
}());
var HistoryStore = (function () {
    function HistoryStore() {
        this.store = getAvailableStorage();
    }
    ;
    HistoryStore.prototype.addElement = function (elem) {
        this.setHistory([elem].concat(this.getHistory()));
    };
    HistoryStore.prototype.getHistory = function () {
        try {
            return JSON.parse(this.store.getItem(STORE_KEY));
        }
        catch (e) {
            return [];
        }
    };
    HistoryStore.prototype.setHistory = function (history) {
        try {
            this.store.setItem(STORE_KEY, JSON.stringify(history.slice(0, MAX_NUMBER_OF_HISTORY_ELEMENTS)));
        }
        catch (e) { }
    };
    HistoryStore.prototype.clear = function () {
        try {
            this.store.removeItem(STORE_KEY);
        }
        catch (e) { }
    };
    return HistoryStore;
}());
exports.HistoryStore = HistoryStore;
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = HistoryStore;

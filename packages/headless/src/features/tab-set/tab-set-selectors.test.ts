import {
  selectActiveTab,
  selectActiveTabExpression,
} from './tab-set-selectors.js';
import type {TabSetState} from './tab-set-state.js';

describe('Tabset Selectors test suite', () => {
  describe('#selectActiveTab', () => {
    it('should return an empty string when state is undefined', () => {
      const result = selectActiveTab(undefined);
      expect(result).toEqual('');
    });

    it('should return an empty string when no tabs are active', () => {
      const state: TabSetState = {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: false, expression: ''},
      };
      const result = selectActiveTab(state);
      expect(result).toEqual('');
    });

    it('should return the id of the active tab when one tab is active', () => {
      const state: TabSetState = {
        tab1: {id: 'tab1', isActive: false, expression: ''},
        tab2: {id: 'tab2', isActive: true, expression: ''},
        tab3: {id: 'tab3', isActive: false, expression: ''},
      };
      const result = selectActiveTab(state);
      expect(result).toEqual('tab2');
    });

    it('should return the first active tab if multiple are active', () => {
      const state: TabSetState = {
        first: {id: 'first', isActive: true, expression: ''},
        second: {id: 'second', isActive: true, expression: ''},
      };
      const result = selectActiveTab(state);
      expect(result).toEqual('first');
    });
  });

  describe('#selectActiveTabExpression', () => {
    it('should return an empty string when state is undefined', () => {
      const result = selectActiveTabExpression(undefined);
      expect(result).toEqual('');
    });

    it('should return an empty string when no active tab exists', () => {
      const state: TabSetState = {
        tab1: {id: 'tab1', isActive: false, expression: 'expr1'},
      };
      const result = selectActiveTabExpression(state);
      expect(result).toEqual('');
    });

    it('should return the expression of the active tab', () => {
      const state: TabSetState = {
        a: {id: 'a', isActive: false, expression: 'A'},
        b: {id: 'b', isActive: true, expression: 'B'},
      };
      const result = selectActiveTabExpression(state);
      expect(result).toEqual('B');
    });

    it('should return an empty string when active tab has no expression', () => {
      const state: TabSetState = {
        x: {id: 'x', isActive: true, expression: ''},
      };
      const result = selectActiveTabExpression(state);
      expect(result).toEqual('');
    });
  });
});

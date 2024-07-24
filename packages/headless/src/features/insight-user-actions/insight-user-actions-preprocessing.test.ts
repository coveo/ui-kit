/* eslint-disable @typescript-eslint/no-unused-vars */
import { InsightAppState } from '../../state/insight-app-state';
import { buildMockInsightState } from '../../test/mock-insight-state';
import { sortActions, filterActions, mapUserActions, splitActionsIntoSessions, findCurrentSession, buildSessionsToDisplay } from './insight-user-actions-preprocessing';


describe('insight user actions preprocessing', () => {
  let state: InsightAppState;

  beforeEach(() => {
    state = buildMockInsightState();
  });

  describe('#sortActions', () => {
    it('should properly sort the raw user actions by most recent to least recent', async () => {
      const result = sortActions();
      expect(result).toBe('something');
    });
  });

  describe('#filterAction', () => {
    it('should properly filter the raw user actions given excludedCustomActions passed in the state', async () => {
      const result = filterActions();
      expect(result).toBe('something');
    });
  });

  describe('#mapUserActions', () => {
    it('should properly map the raw user actions into UserAction objects', async () => {
      const result = mapUserActions();
      expect(result).toBe('something');
    });
  });

  describe('#splitActionsIntoSessions', () => {
    it('should properly split user actions into sessions', async () => {
      const result = splitActionsIntoSessions();
      expect(result).toBe('something');
    });
  });

  describe('#findCurrentSession', () => {
    it('should properly find the current session given the ticketCreationDate passed in the state', async () => {
      const result = findCurrentSession();
      expect(result).toBe('something');
    });
  });

  describe('#buildSessionsToDisplay', () => {
    it('should properly build sessions to be displayed', async () => {
      const result = buildSessionsToDisplay();
      expect(result).toBe('something');
    });
  });
});
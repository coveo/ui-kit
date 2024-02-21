import {Meta} from '@coveo/relay';
import {ConfigurationState} from '../../features/configuration/configuration-state';
import {getClientId} from './event-protocol-utils';

jest.mock('@coveo/relay', () => ({
  createRelay: jest.fn(() => ({
    on: jest.fn(),
    off: jest.fn(),
    updateConfig: jest.fn(),
    emit: jest.fn(),
    clearStorage: jest.fn(),
    version: '1',
    getMeta: () => ({clientId: 'something'}) as Meta,
  })),
}));

describe('event protocol utils', () => {
  describe('getClientId', () => {
    const configurationState = {
      analytics: {
        nextApiBaseUrl: 'www.perdu.com',
        trackingId: 'chat',
        source: {'@coveo/atomic': '12'},
      },
      accessToken: 'uh-oh',
    } as ConfigurationState;

    it('returns the clientId', () => {
      const clientId = getClientId(configurationState);
      expect(clientId).toBe('something');
    });
  });
});

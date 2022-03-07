import {jwtReducer} from './jwt-reducer';
import pino from 'pino';
import {createMockState} from '../../test';
import {SearchAppState} from '../..';
import {setSearchHub} from '../../features/search-hub/search-hub-actions';
import {getSearchHubInitialState} from '../../features/search-hub/search-hub-state';
import {setPipeline} from '../../features/pipeline/pipeline-actions';
import {getPipelineInitialState} from '../../features/pipeline/pipeline-state';
import {
  updateAnalyticsConfiguration,
  updateSearchConfiguration,
} from '../../features/configuration/configuration-actions';
import {getConfigurationInitialState} from '../../features/configuration/configuration-state';

describe('jwt-reducer', () => {
  const logger = pino({level: 'silent'});
  const loggerSpy = jest.spyOn(logger, 'warn');
  const reducer = jwtReducer(logger);
  // expired search token where:
  // - searchHub = 'testing hub'
  // - pipeline = 'testing';
  // - userDisplayname = 'Alice Smith';
  const jwtToken =
    'eyJhbGciOiJIUzI1NiJ9.eyJwaXBlbGluZSI6InRlc3RpbmciLCJzZWFyY2hIdWIiOiJ0ZXN0aW5nIGh1YiIsInY4Ijp0cnVlLCJvcmdhbml6YXRpb24iOiJzZWFyY2h1aXNhbXBsZXMiLCJ1c2VySWRzIjpbeyJhdXRoQ29va2llIjoiIiwicHJvdmlkZXIiOiJFbWFpbCBTZWN1cml0eSBQcm92aWRlciIsIm5hbWUiOiJhc21pdGhAZXhhbXBsZS5jb20iLCJ0eXBlIjoiVXNlciIsImluZm9zIjp7fX1dLCJyb2xlcyI6WyJxdWVyeUV4ZWN1dG9yIl0sInVzZXJEaXNwbGF5TmFtZSI6IkFsaWNlIFNtaXRoIiwiZXhwIjoxNjQ2NzUzNDM0LCJpYXQiOjE2NDY2NjcwMzR9.p70UUYXKmg3sHU961G1Vmwp45qp8EgxvHisPMk-RUPw';

  afterEach(() => {
    jest.clearAllMocks();
  });
  it('should handle access token not being JWT token', () => {
    const initialState = createMockState();
    initialState.configuration.accessToken = 'random stuff';
    const newState = reducer(initialState, {type: 'foo'});
    expect(newState).toMatchObject(initialState);
  });

  describe('when an access token is a valid JWT token', () => {
    let initialState: SearchAppState;
    beforeEach(() => {
      initialState = createMockState();
      initialState.configuration.accessToken = jwtToken;
    });

    describe('when executing setSearchHub', () => {
      it('should reconcile searchHub', () => {
        const newState = reducer(
          initialState,
          setSearchHub('not the correct one')
        );
        expect(newState).toMatchObject({
          ...initialState,
          searchHub: 'testing hub',
        });
      });

      it('should warn when setting search hub to non default', () => {
        reducer(initialState, setSearchHub('not the correct one'));
        expect(loggerSpy).toHaveBeenCalled();
      });

      it('should not warn when initial search hub is default', () => {
        reducer(initialState, setSearchHub(getSearchHubInitialState()));
        expect(loggerSpy).not.toHaveBeenCalled();
      });
    });

    describe('when executing setPipeline', () => {
      it('should reconcile pipeline', () => {
        const newState = reducer(
          initialState,
          setPipeline('not the correct one')
        );
        expect(newState).toMatchObject({...initialState, pipeline: 'testing'});
        expect(newState.pipeline).toEqual('testing');
      });

      it('should warn when pipeline is not default', () => {
        reducer(initialState, setPipeline('not the correct one'));
        expect(loggerSpy).toHaveBeenCalled();
      });

      it('should not warn when pipeline is default', () => {
        reducer(initialState, setPipeline(getPipelineInitialState()));
        expect(loggerSpy).not.toHaveBeenCalled();
      });
    });

    describe('when executing updateSearchConfiguration', () => {
      it('should reconcile searchHub, pipeline', () => {
        initialState.pipeline = 'random pipeline';
        initialState.searchHub = 'random hub';

        const newState = reducer(
          initialState,
          updateSearchConfiguration({
            searchHub: 'not the correct hub',
            pipeline: 'not the correct pipeline',
          })
        );
        expect(newState).toMatchObject({
          ...initialState,
          pipeline: 'testing',
          searchHub: 'testing hub',
        });
      });

      it('should warn when pipeline is not default', () => {
        reducer(
          initialState,
          updateSearchConfiguration({pipeline: 'not the correct one'})
        );
        expect(loggerSpy).toHaveBeenCalled();
      });

      it('should not warn when pipeline is default', () => {
        reducer(
          initialState,
          updateSearchConfiguration({pipeline: getPipelineInitialState()})
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });

      it('should not warn when pipeline is not set', () => {
        reducer(
          initialState,
          updateSearchConfiguration({locale: 'random value'})
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });

      it('should warn when search hub is not default', () => {
        reducer(
          initialState,
          updateSearchConfiguration({searchHub: 'not the correct one'})
        );
        expect(loggerSpy).toHaveBeenCalled();
      });

      it('should not warn when search hub is default', () => {
        reducer(
          initialState,
          updateSearchConfiguration({searchHub: getSearchHubInitialState()})
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });

      it('should not warn when search hub is not set', () => {
        reducer(
          initialState,
          updateSearchConfiguration({locale: 'random value'})
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });
    });

    describe('when executing updateAnalyticsConfiguration', () => {
      it('should reconcile userDisplayName', () => {
        const newState = reducer(
          initialState,
          updateAnalyticsConfiguration({userDisplayName: 'not the correct one'})
        );
        expect(newState).toMatchObject({
          ...initialState,
          configuration: {
            ...initialState.configuration,
            analytics: {
              ...initialState.configuration.analytics,
              userDisplayName: 'Alice Smith',
            },
          },
        });
      });

      it('should warn when userDisplayName is not default', () => {
        reducer(
          initialState,
          updateAnalyticsConfiguration({userDisplayName: 'not the correct one'})
        );
        expect(loggerSpy).toHaveBeenCalled();
      });

      it('should not warn when userDisplayName is default', () => {
        reducer(
          initialState,
          updateAnalyticsConfiguration({
            userDisplayName:
              getConfigurationInitialState().analytics.userDisplayName,
          })
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });

      it('should not warn when userDisplayName is not set', () => {
        reducer(
          initialState,
          updateAnalyticsConfiguration({
            anonymous: true,
          })
        );
        expect(loggerSpy).not.toHaveBeenCalled();
      });
    });
  });
});

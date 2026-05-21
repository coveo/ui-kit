import {configurationSlice} from '@/src/core/internal/configuration/configuration-slice.js';

interface EndpointClientConfiguration {
  organizationId?: string;
  accessToken?: string;
  endpoint?: string;
}

type ConfigurationSliceState = ReturnType<
  typeof configurationSlice.getInitialState
>;

type StateWithConfigurationSlice = {
  configuration?: ConfigurationSliceState;
};

interface StateReader {
  read<T>(selector: (state: StateWithConfigurationSlice) => T): T;
}

export const buildEndpointClientConfiguration = (
  engine: StateReader
): EndpointClientConfiguration => {
  const readConfigurationSelector = <T>(
    selector: (state: {configuration: ConfigurationSliceState}) => T
  ) => {
    return engine.read((state) => {
      const configuration =
        state.configuration ?? configurationSlice.getInitialState();
      return selector({configuration});
    });
  };

  return {
    organizationId: readConfigurationSelector(
      configurationSlice.selectors.organizationId
    ),
    accessToken: readConfigurationSelector(
      configurationSlice.selectors.accessToken
    ),
    endpoint: readConfigurationSelector(configurationSlice.selectors.endpoint),
  };
};

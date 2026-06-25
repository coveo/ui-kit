import {configurationSlice} from './configuration-slice.js';

type ConfigurationSliceState = ReturnType<
  typeof configurationSlice.getInitialState
>;

type StateWithConfigurationSlice = {
  configuration?: ConfigurationSliceState;
};

export interface ConfigurationStateReader {
  read<T>(selector: (state: StateWithConfigurationSlice) => T): T;
}

const readConfigurationSelector = <T>(
  reader: ConfigurationStateReader,
  selector: (state: {configuration: ConfigurationSliceState}) => T
) => {
  return reader.read((state) => {
    const configuration =
      state.configuration ?? configurationSlice.getInitialState();
    return selector({configuration});
  });
};

export const readEndpointClientConfiguration = (
  reader: ConfigurationStateReader
) => {
  return {
    organizationId: readConfigurationSelector(
      reader,
      configurationSlice.selectors.organizationId
    ),
    accessToken: readConfigurationSelector(
      reader,
      configurationSlice.selectors.accessToken
    ),
    endpoint: readConfigurationSelector(
      reader,
      configurationSlice.selectors.endpoint
    ),
  };
};

export const readConversationRequestDefaults = (
  reader: ConfigurationStateReader
) => {
  return {
    trackingId: readConfigurationSelector(
      reader,
      configurationSlice.selectors.trackingId
    ),
    language: readConfigurationSelector(
      reader,
      configurationSlice.selectors.language
    ),
    country: readConfigurationSelector(
      reader,
      configurationSlice.selectors.country
    ),
    currency: readConfigurationSelector(
      reader,
      configurationSlice.selectors.currency
    ),
  };
};

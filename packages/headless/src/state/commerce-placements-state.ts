import {
  ConfigurationSection,
  PlacementSection,
  VersionSection,
} from './state-sections';

export type CommercePlacementsAppState = ConfigurationSection &
  VersionSection &
  PlacementSection;

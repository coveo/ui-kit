import {
  UserProfileSection,
  ConfigurationSection,
  DebugSection,
} from './state-sections';

export type UserProfileAppState = ConfigurationSection &
  UserProfileSection &
  DebugSection;

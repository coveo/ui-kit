import {
  CartSection,
  CommerceContextSection,
  ConfigurationSection,
} from '../../state/state-sections';

export type StateNeededByCartAnalyticsProvider = ConfigurationSection &
  CommerceContextSection &
  CartSection;

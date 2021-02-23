import {ConfigurationSection} from '../../state/state-sections';

export const getLanguage = (state: ConfigurationSection) => {
  const langKey = state.configuration.search.locale.split('-')[0];
  if (!langKey || langKey.length !== 2) {
    return 'en';
  }
  return langKey;
};

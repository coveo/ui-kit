import {createReactComponent} from '@copilotkit/a2ui-renderer';
import {SearchIcon} from '../icons/index.js';
import {
  SearchOptionsPropsSchema,
  type SearchOptionItem,
  type SearchOptionsAction,
} from './search-options-contract.js';
import styles from './SearchOptions.module.css';

/**
 * A2-UI component for the agent `SearchOptions`. The generic binder resolves `items` from
 * `SearchOptionsPropsSchema`; each item is a label and the gateway-assigned `optionId` of the
 * search saved behind it. Selecting one dispatches `selectSearchOption {optionId}`, and the
 * gateway answers with a new commerce-search surface.
 */
export const SearchOptions = createReactComponent(
  {
    name: 'SearchOptions',
    schema: SearchOptionsPropsSchema,
  },
  ({props, context}) => {
    const items = props.items ?? [];

    if (items.length === 0) {
      return null;
    }

    const handleSelectOption = (item: SearchOptionItem) => {
      const selectSearchOptionAction: SearchOptionsAction = {
        event: {name: 'selectSearchOption', context: {optionId: item.optionId}},
      };
      context.dispatchAction(selectSearchOptionAction);
    };

    return (
      <div className={styles.container} role="group" aria-label="Search options">
        {items.map((item: SearchOptionItem) => (
          <button
            key={item.optionId}
            className={styles.optionButton}
            onClick={() => handleSelectOption(item)}
            type="button"
          >
            <SearchIcon />
            {item.label}
          </button>
        ))}
      </div>
    );
  }
);

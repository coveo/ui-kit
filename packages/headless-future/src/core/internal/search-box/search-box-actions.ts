import {createAction} from '@reduxjs/toolkit';

const ACTION_PREFIX = 'searchBox';

export const setQuery = createAction<string>(`${ACTION_PREFIX}/setQuery`);

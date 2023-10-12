import {createReducer} from '@reduxjs/toolkit';
import {VERSION} from '../../utils/version.js';

export const versionReducer = createReducer(VERSION, (builder) => builder);

import {Reducer, createReducer} from '@reduxjs/toolkit';
import {VERSION} from '../../utils/version.js';

export const versionReducer: Reducer<string> = createReducer(VERSION, (builder) => builder);

import {createReducer} from '@reduxjs/toolkit';
import {VERSION} from '../../utils/version';

export const versionReducer = createReducer(VERSION, (builder) => builder);

import {createAsyncThunk} from '@reduxjs/toolkit';

export const fetchResultPreview = createAsyncThunk(
  'quickview/fetchResultPreview',
  async (uniqueId: string, {dispatch}) => {}
);

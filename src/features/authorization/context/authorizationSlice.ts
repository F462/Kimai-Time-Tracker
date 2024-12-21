import {createSlice} from '@reduxjs/toolkit';
import {AuthorizationState} from '../types';

const initialState: AuthorizationState = {
  apiKey: undefined,
};

const authorizationSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    apiKeyReceived: (state, {payload: apiKey}) => {
      state.apiKey = apiKey;
    },
  },
});

export const {apiKeyReceived} = authorizationSlice.actions;
export const authorizationReducer = authorizationSlice.reducer;

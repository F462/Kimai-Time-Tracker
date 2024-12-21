import {createSlice} from '@reduxjs/toolkit';
import {AuthorizationState} from '../types';

const initialState: AuthorizationState = {
  value: 'a',
};

const authorizationSlice = createSlice({
  name: 'authorization',
  initialState,
  reducers: {
    incremented: state => {
      // Redux Toolkit allows us to write "mutating" logic in reducers. It
      // doesn't actually mutate the state because it uses the Immer library,
      // which detects changes to a "draft state" and produces a brand new
      // immutable state based off those changes
      state.value = 'a';
    },
  },
});

export const {incremented} = authorizationSlice.actions;
export const authorizationReducer = authorizationSlice.reducer;

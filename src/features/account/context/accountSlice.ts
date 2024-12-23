import {createSlice} from '@reduxjs/toolkit';
import {AccountState} from '../types';

const initialState: AccountState = {
	apiKey: undefined,
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {
		apiKeyReceived: (state, {payload: apiKey}) => {
			state.apiKey = apiKey;
		},
	},
});

export const {apiKeyReceived} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

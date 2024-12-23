import {createSlice} from '@reduxjs/toolkit';
import {AccountState} from '../types';
import {apiKeyReceived} from './accountActions';

const initialState: AccountState = {
	apiKey: undefined,
	serverUrl: undefined,
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(apiKeyReceived, (state, {payload: apiKey}) => {
			state.apiKey = apiKey;
		});
	},
});

export const {} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

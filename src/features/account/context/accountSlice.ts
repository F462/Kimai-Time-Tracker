import {createSlice} from '@reduxjs/toolkit';

import {apiKeyReceived, serverUrlReceived} from './accountActions';
import {AccountState} from '../types';

const initialState: AccountState = {
	apiKey: undefined,
	serverUrl: undefined
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(serverUrlReceived, (state, {payload: serverUrl}) => {
				state.serverUrl = serverUrl;
			})
			.addCase(apiKeyReceived, (state, {payload: apiKey}) => {
				state.apiKey = apiKey;
			});
	}
});

export const {} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

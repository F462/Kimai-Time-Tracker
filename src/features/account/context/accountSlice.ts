import {createSlice} from '@reduxjs/toolkit';

import {AccountState} from '../types';
import {serverUrlReceived} from './accountActions';

const initialState: AccountState = {
	serverUrl: undefined
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder.addCase(serverUrlReceived, (state, {payload: serverUrl}) => {
			state.serverUrl = serverUrl;
		});
	}
});

export const {} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

import {createSlice} from '@reduxjs/toolkit';

import {userLoggedIn, userLoggedOut} from './accountActions';
import {AccountState} from '../types';

const initialState: AccountState = {
	serverUrl: undefined
};

const accountSlice = createSlice({
	name: 'account',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(userLoggedIn, (state, {payload: serverUrl}) => {
				state.serverUrl = serverUrl;
			})
			.addCase(userLoggedOut, state => {
				state.serverUrl = undefined;
			});
	}
});

export const {} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

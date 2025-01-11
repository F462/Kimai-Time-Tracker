import {createSlice, isAnyOf} from '@reduxjs/toolkit';

import {AccountState} from '../types';
import {loginUser} from '../middleware/accountThunks';
import {userLoggedIn} from './accountActions';

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
			.addCase(loginUser.pending, state => {
				state.isUserLoggingIn = true;
			})
			.addMatcher(isAnyOf(loginUser.rejected, loginUser.fulfilled), state => {
				state.isUserLoggingIn = false;
			});
	}
});

export const {} = accountSlice.actions;
export const accountReducer = accountSlice.reducer;

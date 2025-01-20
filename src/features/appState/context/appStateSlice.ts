import {createSlice, isAnyOf} from '@reduxjs/toolkit';

import {
	loginUser,
	logoutUser
} from 'src/features/account/middleware/accountThunks';
import {AppStateState} from '../types';

const initialState: AppStateState = {};

const appStateSlice = createSlice({
	name: 'appState',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(loginUser.pending, state => {
				state.isUserLoggingIn = true;
			})
			.addCase(logoutUser.pending, state => {
				state.isUserLoggingOut = true;
			})
			.addMatcher(isAnyOf(loginUser.rejected, loginUser.fulfilled), state => {
				state.isUserLoggingIn = false;
			})
			.addMatcher(isAnyOf(logoutUser.rejected, logoutUser.fulfilled), state => {
				state.isUserLoggingOut = false;
			});
	}
});

export const {} = appStateSlice.actions;
export const appStateReducer = appStateSlice.reducer;

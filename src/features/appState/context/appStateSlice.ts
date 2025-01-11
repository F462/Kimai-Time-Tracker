import {createSlice, isAnyOf} from '@reduxjs/toolkit';

import {AppStateState} from '../types';
import {loginUser} from 'src/features/account/middleware/accountThunks';

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
			.addMatcher(isAnyOf(loginUser.rejected, loginUser.fulfilled), state => {
				state.isUserLoggingIn = false;
			});
	}
});

export const {} = appStateSlice.actions;
export const appStateReducer = appStateSlice.reducer;

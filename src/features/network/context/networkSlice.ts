import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {NetworkState} from '../types';

const initialState: NetworkState = {
	isInternetReachable: undefined
};

const networkSlice = createSlice({
	name: 'network',
	initialState,
	reducers: {
		internetReachabilityChanged: (
			state,
			{payload: isInternetReachable}: PayloadAction<boolean | undefined>
		) => {
			state.isInternetReachable = isInternetReachable;
		}
	}
});

export const {internetReachabilityChanged} = networkSlice.actions;
export const networkReducer = networkSlice.reducer;

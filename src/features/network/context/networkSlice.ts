import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {NetworkState} from '../types';

const initialState: NetworkState = {
	isInternetReachable: null
};

const networkSlice = createSlice({
	name: 'network',
	initialState,
	reducers: {
		internetReachabilityChanged: (
			state,
			{payload: isInternetReachable}: PayloadAction<boolean | null>
		) => {
			state.isInternetReachable = isInternetReachable;
		}
	}
});

export const {internetReachabilityChanged} = networkSlice.actions;
export const networkReducer = networkSlice.reducer;

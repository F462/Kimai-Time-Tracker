import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectNetworkState = (state: RootState) => state.network;

export const selectIsInternetReachable = createSelector(
	[selectNetworkState],
	(networkState) => networkState.isInternetReachable
);

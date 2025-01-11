import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectAccountState = (state: RootState) => state.account;

export const selectServerUrl = createSelector(
	[selectAccountState],
	accountState => accountState.serverUrl
);

export const selectIsUserLoggedIn = createSelector(
	[selectServerUrl],
	serverUrl => serverUrl !== undefined
);

export const selectIsUserLoggingIn = createSelector(
	[selectAccountState],
	accountState => accountState.isUserLoggingIn
);

import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectAppState = (state: RootState) => state.appState;

export const selectIsUserLoggingIn = createSelector(
	[selectAppState],
	(appState) => appState.isUserLoggingIn,
);

export const selectIsUserLoggingOut = createSelector(
	[selectAppState],
	(appState) => appState.isUserLoggingOut,
);

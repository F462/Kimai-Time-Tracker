import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';
import {selectIsBiometricsToUnlockEnabled} from 'src/features/settings/context/settingsSelectors';

const selectAppState = (state: RootState) => state.appState;

export const selectIsUserLoggingIn = createSelector(
	[selectAppState],
	(appState) => appState.isUserLoggingIn,
);

export const selectIsUserLoggingOut = createSelector(
	[selectAppState],
	(appState) => appState.isUserLoggingOut,
);

export const selectIsSessionUnlocked = createSelector(
	[selectAppState, selectIsBiometricsToUnlockEnabled],
	(appState, isBiometricsToUnlockEnabled) => {
		if (isBiometricsToUnlockEnabled) {
			return !!appState.isSessionUnlocked;
		}

		return true;
	},
);

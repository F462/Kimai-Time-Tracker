import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectSettingsState = (state: RootState) => state.settings;

export const selectAppTheme = createSelector(
	[selectSettingsState],
	(settings) => settings.appTheme,
);

export const selectIsBiometricsToUnlockEnabled = createSelector(
	[selectSettingsState],
	(settings) => settings.isBiometricsToUnlockEnabled,
);

export const selectWorkContractHoursPerDay = createSelector(
	[selectSettingsState],
	(settings) => settings.workContractHoursPerDay,
);

export const selectIsWorkContractHoursSyncPending = createSelector(
	[selectSettingsState],
	(settings) => settings.workContractHoursSyncPending === true,
);

export const selectIsWorkContractHoursSyncInProgress = createSelector(
	[selectSettingsState],
	(settings) => settings.workContractHoursSyncInProgress === true,
);

export const selectIsWorkContractHoursSyncWaiting = createSelector(
	[selectSettingsState],
	(settings) => settings.workContractHoursSyncWaiting === true,
);

export const selectHasWorkContractHoursSyncStatus = createSelector(
	[
		selectIsWorkContractHoursSyncPending,
		selectIsWorkContractHoursSyncWaiting,
		selectIsWorkContractHoursSyncInProgress,
	],
	(isPending, isWaiting, isInProgress) =>
		isPending || isWaiting || isInProgress,
);

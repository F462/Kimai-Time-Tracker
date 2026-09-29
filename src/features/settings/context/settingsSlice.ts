import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {AppTheme, SettingsState} from '../types';

const initialState: SettingsState = {
	appTheme: AppTheme.SYSTEM,
	isBiometricsToUnlockEnabled: false,
	standardWorkingHoursPerDay: 8,
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		appThemeSet: (state, {payload: appTheme}: PayloadAction<AppTheme>) => {
			state.appTheme = appTheme;
		},
		biometricsToUnlockEnabledStateSet: (
			state,
			{payload: biometricsEnabled}: PayloadAction<boolean>,
		) => {
			state.isBiometricsToUnlockEnabled = biometricsEnabled;
		},
		standardWorkingHoursPerDaySet: (
			state,
			{payload: standardWorkingHoursPerDay}: PayloadAction<number>,
		) => {
			state.standardWorkingHoursPerDay = standardWorkingHoursPerDay;
		},
	},
});

export const {
	appThemeSet,
	biometricsToUnlockEnabledStateSet,
	standardWorkingHoursPerDaySet,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

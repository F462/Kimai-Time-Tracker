import {AppTheme, SettingsState} from '../types';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState: SettingsState = {
	appTheme: AppTheme.SYSTEM,
	isBiometricsToUnlockEnabled: false,
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
	},
});

export const {appThemeSet, biometricsToUnlockEnabledStateSet} =
	settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

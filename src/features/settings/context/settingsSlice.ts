import {AppTheme, SettingsState} from '../types';
import {PayloadAction, createSlice} from '@reduxjs/toolkit';

const initialState: SettingsState = {
	appTheme: AppTheme.SYSTEM,
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		appThemeSet: (state, {payload: appTheme}: PayloadAction<AppTheme>) => {
			state.appTheme = appTheme;
		},
	},
});

export const {appThemeSet} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

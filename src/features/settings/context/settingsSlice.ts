import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {
	AppTheme,
	SettingsState,
	WORK_DAYS,
	WorkContractHours,
	WorkDay,
} from '../types';

const DEFAULT_WORK_CONTRACT_HOURS: WorkContractHours = {
	monday: 8,
	tuesday: 8,
	wednesday: 8,
	thursday: 8,
	friday: 8,
	saturday: 0,
	sunday: 0,
};

const initialState: SettingsState = {
	appTheme: AppTheme.SYSTEM,
	isBiometricsToUnlockEnabled: false,
	workContractHoursPerDay: DEFAULT_WORK_CONTRACT_HOURS,
	workContractHoursSyncPending: false,
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
		workContractHoursPerDaySet: (
			state,
			{
				payload,
			}: PayloadAction<{
				day: WorkDay;
				hours: number;
			}>,
		) => {
			state.workContractHoursPerDay[payload.day] = payload.hours;
			state.workContractHoursSyncPending = true;
		},
		workContractHoursPerDaySynchronized: (
			state,
			{payload}: PayloadAction<WorkContractHours>,
		) => {
			state.workContractHoursPerDay = payload;
			state.workContractHoursSyncPending = false;
		},
		workContractHoursSyncCompleted: (
			state,
			{payload}: PayloadAction<WorkContractHours>,
		) => {
			if (
				WORK_DAYS.every(
					(day) => state.workContractHoursPerDay[day] === payload[day],
				)
			) {
				state.workContractHoursSyncPending = false;
			}
		},
	},
});

export const {
	appThemeSet,
	biometricsToUnlockEnabledStateSet,
	workContractHoursPerDaySet,
	workContractHoursPerDaySynchronized,
	workContractHoursSyncCompleted,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

export const migrateLegacyWorkingHours = (legacyHours: number) =>
	Object.fromEntries(
		WORK_DAYS.map((day) => [
			day,
			day === 'saturday' || day === 'sunday' ? 0 : legacyHours,
		]),
	) as WorkContractHours;

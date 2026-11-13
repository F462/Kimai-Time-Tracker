import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {
	AppTheme,
	AutomaticBackupIntervalDays,
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
	isDarkOledEnabled: false,
	isBiometricsToUnlockEnabled: false,
	// The active-timesheet notification is a feature the user may rely on to
	// keep an eye on the running timesheet, so it is on by default.
	isActiveTimesheetNotificationEnabled: true,
	automaticBackupIntervalDays: 0,
	lastAutomaticBackupAt: null,
	workContractHoursPerDay: DEFAULT_WORK_CONTRACT_HOURS,
	workContractHoursLastSynchronized: DEFAULT_WORK_CONTRACT_HOURS,
	workContractHoursSyncPending: false,
	workContractHoursSyncWaiting: false,
	workContractHoursSyncInProgress: false,
};

const settingsSlice = createSlice({
	name: 'settings',
	initialState,
	reducers: {
		appThemeSet: (state, {payload: appTheme}: PayloadAction<AppTheme>) => {
			state.appTheme = appTheme;
		},
		darkOledEnabledSet: (
			state,
			{payload: isDarkOledEnabled}: PayloadAction<boolean>,
		) => {
			state.isDarkOledEnabled = isDarkOledEnabled;
		},
		biometricsToUnlockEnabledStateSet: (
			state,
			{payload: biometricsEnabled}: PayloadAction<boolean>,
		) => {
			state.isBiometricsToUnlockEnabled = biometricsEnabled;
		},
		activeTimesheetNotificationEnabledSet: (
			state,
			{payload: enabled}: PayloadAction<boolean>,
		) => {
			state.isActiveTimesheetNotificationEnabled = enabled;
		},
		automaticBackupIntervalDaysSet: (
			state,
			{payload: intervalDays}: PayloadAction<AutomaticBackupIntervalDays>,
		) => {
			state.automaticBackupIntervalDays = intervalDays;
		},
		automaticBackupCompleted: (
			state,
			{payload: timestamp}: PayloadAction<number>,
		) => {
			state.lastAutomaticBackupAt = timestamp;
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
			if (!state.workContractHoursLastSynchronized) {
				state.workContractHoursLastSynchronized = {
					...state.workContractHoursPerDay,
				};
			}
			state.workContractHoursPerDay[payload.day] = payload.hours;
			state.workContractHoursSyncPending = WORK_DAYS.some(
				(day) =>
					state.workContractHoursPerDay[day] !==
					state.workContractHoursLastSynchronized[day],
			);
		},
		workContractHoursPerDaySynchronized: (
			state,
			{payload}: PayloadAction<WorkContractHours>,
		) => {
			state.workContractHoursPerDay = payload;
			state.workContractHoursLastSynchronized = payload;
			state.workContractHoursSyncPending = false;
			state.workContractHoursSyncWaiting = false;
		},
		workContractHoursSyncReconciled: (
			state,
			{
				payload,
			}: PayloadAction<{
				hours: WorkContractHours;
				lastSynchronized: WorkContractHours;
			}>,
		) => {
			state.workContractHoursPerDay = payload.hours;
			state.workContractHoursLastSynchronized = payload.lastSynchronized;
			state.workContractHoursSyncPending = WORK_DAYS.some(
				(day) => payload.hours[day] !== payload.lastSynchronized[day],
			);
			state.workContractHoursSyncWaiting = false;
		},
		workContractHoursSyncWaiting: (state) => {
			state.workContractHoursSyncWaiting = true;
		},
		workContractHoursSyncAborted: (state) => {
			state.workContractHoursPerDay = {
				...(state.workContractHoursLastSynchronized ??
					state.workContractHoursPerDay),
			};
			state.workContractHoursSyncPending = false;
			state.workContractHoursSyncWaiting = false;
			state.workContractHoursSyncInProgress = false;
		},
		workContractHoursSyncStarted: (state) => {
			state.workContractHoursSyncWaiting = false;
			state.workContractHoursSyncInProgress = true;
		},
		workContractHoursSyncFinished: (state) => {
			state.workContractHoursSyncInProgress = false;
		},
		workContractHoursSyncCompleted: (
			state,
			{payload}: PayloadAction<WorkContractHours>,
		) => {
			state.workContractHoursLastSynchronized = payload;
			if (
				WORK_DAYS.every(
					(day) => state.workContractHoursPerDay[day] === payload[day],
				)
			) {
				state.workContractHoursSyncPending = false;
			}
			state.workContractHoursSyncWaiting = false;
		},
	},
});

export const {
	appThemeSet,
	darkOledEnabledSet,
	biometricsToUnlockEnabledStateSet,
	activeTimesheetNotificationEnabledSet,
	automaticBackupIntervalDaysSet,
	automaticBackupCompleted,
	workContractHoursPerDaySet,
	workContractHoursPerDaySynchronized,
	workContractHoursSyncReconciled,
	workContractHoursSyncWaiting,
	workContractHoursSyncAborted,
	workContractHoursSyncStarted,
	workContractHoursSyncFinished,
	workContractHoursSyncCompleted,
} = settingsSlice.actions;
export const settingsReducer = settingsSlice.reducer;

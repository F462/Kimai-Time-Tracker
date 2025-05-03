import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import dayjs from 'dayjs';

import {Timesheet, TimesheetsState} from '../types';
import {
	newTimesheetStarted,
	timesheetStopped,
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {timesheetSynced} from 'src/features/synchronization/context/synchronizationSlice';

const initialState: TimesheetsState = {
	timesheets: {},
	timesheetIdTable: {},
};

const timesheetsSlice = createSlice({
	name: 'timesheets',
	initialState,
	reducers: {
		timesheetsUpdated: (
			state,
			{
				payload,
			}: PayloadAction<{
				timesheets: {[timesheetId: string]: Timesheet};
				newTimesheetsIdTable: {[localId: string]: number};
			}>,
		) => {
			state.timesheets = payload.timesheets;
			state.timesheetIdTable = {
				...state.timesheetIdTable,
				...payload.newTimesheetsIdTable,
			};
		},
		timesheetDeleted: (
			state,
			{payload: timesheetId}: PayloadAction<string>,
		) => {
			delete state.timesheets[timesheetId];
		},
	},
	extraReducers: (builder) => {
		builder
			.addCase(newTimesheetStarted, (state, {payload: timesheet}) => {
				state.timesheets[timesheet.id] = timesheet;
			})
			.addCase(timesheetStopped, (state, {payload: timesheetId}) => {
				const timesheet = state.timesheets[timesheetId];

				if (timesheet === undefined) {
					console.warn(`Could not find timesheet with ID ${timesheetId}`);
					return;
				}

				timesheet.end = dayjs().toISOString();
			})
			.addCase(timesheetSynced, (state, {payload: {localId, remoteId}}) => {
				const timesheet = state.timesheets[localId];

				if (timesheet === undefined) {
					console.warn(`Timesheet with ID ${localId} not found`);
					return;
				}

				state.timesheetIdTable[localId] = remoteId;
			});
	},
});

export const {timesheetsUpdated, timesheetDeleted} = timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

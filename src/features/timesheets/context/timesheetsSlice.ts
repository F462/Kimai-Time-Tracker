import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import _ from 'lodash';
import dayjs from 'dayjs';
import {v4 as uuidv4} from 'uuid';

import {TimesheetFromApi, TimesheetsState} from '../types';
import {
	newTimesheetStarted,
	timesheetStopped
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';

const initialState: TimesheetsState = {
	timesheets: {},
	timesheetIdTable: {}
};

const timesheetsSlice = createSlice({
	name: 'timesheets',
	initialState,
	reducers: {
		timesheetsReceived: (
			state,
			{payload}: PayloadAction<Array<TimesheetFromApi>>
		) => {
			const knownRemoteTimesheetIds = _.invert(state.timesheetIdTable);

			state.timesheets = payload.reduce((container, element) => {
				const id = knownRemoteTimesheetIds[element.id] ?? uuidv4();
				state.timesheetIdTable[id] = element.id;
				return {...container, [id]: {...element, isSynced: true}};
			}, {});
		},
		timesheetSynced: (
			state,
			{
				payload: {localId, remoteId}
			}: PayloadAction<{
				localId: string;
				remoteId: number;
			}>
		) => {
			const timesheet = state.timesheets[localId];

			if (timesheet === undefined) {
				console.warn(`Timesheet with ID ${localId} not found`);
				return;
			}

			timesheet.isSynced = true;
			state.timesheetIdTable[localId] = remoteId;
		}
	},
	extraReducers: builder => {
		builder
			.addCase(newTimesheetStarted, (state, {payload: timesheet}) => {
				timesheet.isSynced = false;
				state.timesheets[timesheet.id] = timesheet;
			})
			.addCase(timesheetStopped, (state, {payload: timesheetId}) => {
				const timesheet = state.timesheets[timesheetId];

				if (timesheet === undefined) {
					console.warn(`Could not find timesheet with ID ${timesheetId}`);
					return;
				}

				timesheet.isSynced = false;
				timesheet.end = dayjs().toISOString();
			});
	}
});

export const {timesheetsReceived, timesheetSynced} = timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import _ from 'lodash';
import dayjs from 'dayjs';
import {v4 as uuidv4} from 'uuid';

import {TimesheetFromApi, TimesheetsState} from '../types';
import {
	newTimesheetStarted,
	timesheetStopped
} from 'src/features/activeTimesheet/context/activeTimesheetSlice';
import {timesheetSynced} from 'src/features/synchronization/context/synchronizationSlice';

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
				return {...container, [id]: {...element, id, isSynced: true}};
			}, {});
		}
	},
	extraReducers: builder => {
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
	}
});

export const {timesheetsReceived} = timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

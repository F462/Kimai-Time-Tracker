import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Timesheet} from 'src/features/timesheets/types';
import {ActiveTimesheetState} from '../types';

const initialState: ActiveTimesheetState = {
	activeTimesheetId: undefined,
};

const activeTimesheetSlice = createSlice({
	name: 'activeTimesheet',
	initialState,
	reducers: {
		newTimesheetStarted: (
			state,
			{payload: timesheet}: PayloadAction<Timesheet>,
		) => {
			state.activeTimesheetId = timesheet.id;
		},
		nextTimesheetStartDatetimeSet: (
			state,
			{payload}: PayloadAction<number | undefined>,
		) => {
			state.nextTimesheetStartDatetime = payload;
		},
		timesheetStopped: (
			state,
			{payload: timesheetId}: PayloadAction<string>,
		) => {
			if (timesheetId === state.activeTimesheetId) {
				state.activeTimesheetId = undefined;
			}
		},
	},
});

export const {
	newTimesheetStarted,
	nextTimesheetStartDatetimeSet,
	timesheetStopped,
} = activeTimesheetSlice.actions;
export const activeTimesheetReducer = activeTimesheetSlice.reducer;

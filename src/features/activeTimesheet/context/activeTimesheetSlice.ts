import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {timesheetEdited} from 'src/features/timesheets/context/timesheetActions';
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
	extraReducers: (builder) => {
		builder.addCase(timesheetEdited, (state, {payload: timesheet}) => {
			if (timesheet.end == null) {
				// The edited timesheet is ongoing (running), so it becomes the active timesheet.
				state.activeTimesheetId = timesheet.id;
			} else if (timesheet.id === state.activeTimesheetId) {
				// The edited timesheet was ended and it was the active one, so it is no longer active.
				state.activeTimesheetId = undefined;
			}
		});
	},
});

export const {
	newTimesheetStarted,
	nextTimesheetStartDatetimeSet,
	timesheetStopped,
} = activeTimesheetSlice.actions;
export const activeTimesheetReducer = activeTimesheetSlice.reducer;

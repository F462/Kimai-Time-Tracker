import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ActiveTimesheetState} from '../types';
import {Timesheet} from 'src/features/timesheets/types';

const initialState: ActiveTimesheetState = {
	activeTimesheetId: undefined
};

const activeTimesheetSlice = createSlice({
	name: 'activeTimesheet',
	initialState,
	reducers: {
		activeTimesheetReceived: (
			state,
			{payload}: PayloadAction<Timesheet | undefined>
		) => {
			state.activeTimesheetId = payload?.id;
		},
		nextTimesheetStartDatetimeSet: (
			state,
			{payload}: PayloadAction<number | undefined>
		) => {
			state.nextTimesheetStartDatetime = payload;
		}
	}
});

export const {activeTimesheetReceived, nextTimesheetStartDatetimeSet} =
	activeTimesheetSlice.actions;
export const activeTimesheetReducer = activeTimesheetSlice.reducer;

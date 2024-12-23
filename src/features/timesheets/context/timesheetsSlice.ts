import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Timesheet, TimesheetsState} from '../types';

const initialState: TimesheetsState = {
	timesheets: {},
	activeTimesheet: undefined
};

const timesheetsSlice = createSlice({
	name: 'timesheets',
	initialState,
	reducers: {
		timesheetsReceived: (state, {payload}: PayloadAction<Array<Timesheet>>) => {
			state.timesheets = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				{}
			);
		},
		activeTimesheetReceived: (
			state,
			{payload}: PayloadAction<Timesheet | undefined>
		) => {
			if (payload !== undefined && state.timesheets[payload.id] === undefined) {
				state.timesheets[payload.id] = payload;
			}

			state.activeTimesheet = payload?.id;
		}
	}
});

export const {timesheetsReceived, activeTimesheetReceived} =
	timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

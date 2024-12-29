import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {Timesheet, TimesheetsState} from '../types';
import {activeTimesheetReceived} from 'src/features/activeTimesheet/context/activeTimesheetSlice';

const initialState: TimesheetsState = {
	timesheets: {}
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
		}
	},
	extraReducers: builder => {
		builder.addCase(
			activeTimesheetReceived,
			(state, {payload}: PayloadAction<Timesheet | undefined>) => {
				if (
					payload !== undefined &&
					state.timesheets[payload.id] === undefined
				) {
					state.timesheets[payload.id] = payload;
				}
			}
		);
	}
});

export const {timesheetsReceived} = timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

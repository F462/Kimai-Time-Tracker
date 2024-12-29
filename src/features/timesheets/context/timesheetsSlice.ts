import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {OfflineTimesheet, Timesheet, TimesheetsState} from '../types';
import {activeTimesheetReceived} from 'src/features/activeTimesheet/context/activeTimesheetSlice';

const initialState: TimesheetsState = {
	timesheets: {},
	offlineTimesheets: {}
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
		offlineTimesheetAdded: (
			state,
			{payload}: PayloadAction<OfflineTimesheet>
		) => {
			state.offlineTimesheets[payload.id] = payload;
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

export const {timesheetsReceived, offlineTimesheetAdded} =
	timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

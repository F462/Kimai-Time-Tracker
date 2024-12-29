import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ActiveTimesheetState} from '../types';
import {Timesheet} from 'src/features/timesheets/types';
import {offlineTimesheetAdded} from '../../timesheets/context/timesheetsSlice';

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
	},
	extraReducers: builder => {
		builder.addCase(offlineTimesheetAdded, (state, {payload}) => {
			state.activeTimesheetId = payload?.id;
		});
	}
});

export const {activeTimesheetReceived, nextTimesheetStartDatetimeSet} =
	activeTimesheetSlice.actions;
export const activeTimesheetReducer = activeTimesheetSlice.reducer;

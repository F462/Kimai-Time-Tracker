import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {TimesheetsState} from '../types';

const initialState: TimesheetsState = {
	timesheetList: []
};

const timesheetsSlice = createSlice({
	name: 'timesheets',
	initialState,
	reducers: {
		timesheetsReceived: (
			state,
			{payload}: PayloadAction<TimesheetsState['timesheetList']>
		) => {
			state.timesheetList = payload;
		}
	}
});

export const {timesheetsReceived} = timesheetsSlice.actions;
export const timesheetsReducer = timesheetsSlice.reducer;

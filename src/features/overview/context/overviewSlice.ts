import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import type {MonthlyOverviewData} from '../utils/overviewUtils';

export type OverviewState = MonthlyOverviewData | null;

const overviewSlice = createSlice({
	name: 'overview',
	// The overview is derived from the timesheets and the settings, so it
	// starts out empty and is (re)calculated when the timesheets are fetched.
	// It is kept out of the persisted state (see the persist config) because
	// it can always be re-derived from the persisted timesheets.
	//
	// The `null` is inlined (rather than stored in a typed constant) because
	// Redux Toolkit's generic inference otherwise collapses the state type to
	// `null` instead of `MonthlyOverviewData | null`.
	initialState: null as OverviewState,
	reducers: {
		overviewUpdated: (_, {payload}: PayloadAction<MonthlyOverviewData>) =>
			payload,
	},
});

export const {overviewUpdated} = overviewSlice.actions;
export const overviewReducer = overviewSlice.reducer;

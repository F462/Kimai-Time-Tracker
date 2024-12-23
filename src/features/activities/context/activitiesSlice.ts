import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ActivitiesState} from '../types';

const initialState: ActivitiesState = {
	activityList: []
};

const activitiesSlice = createSlice({
	name: 'activities',
	initialState,
	reducers: {
		activitiesReceived: (
			state,
			{payload}: PayloadAction<ActivitiesState['activityList']>
		) => {
			state.activityList = payload;
		}
	}
});

export const {activitiesReceived} = activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;

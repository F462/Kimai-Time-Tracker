import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {ActivitiesState, Activity} from '../types';

const initialState: ActivitiesState = {
	activities: {},
	selectedActivityId: undefined,
};

const activitiesSlice = createSlice({
	name: 'activities',
	initialState,
	reducers: {
		activitiesReceived: (state, {payload}: PayloadAction<Array<Activity>>) => {
			state.activities = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				{},
			);
		},
		activitySelected: (
			state,
			{payload: activityId}: PayloadAction<number | undefined>,
		) => {
			state.selectedActivityId = activityId;
		},
	},
});

export const {activitiesReceived, activitySelected} = activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;

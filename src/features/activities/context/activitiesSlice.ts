import {createSlice, PayloadAction} from '@reduxjs/toolkit';

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
		activityRemoved: (state, {payload: activityId}: PayloadAction<number>) => {
			delete state.activities[activityId];

			if (state.selectedActivityId === activityId) {
				state.selectedActivityId = undefined;
			}
		},
	},
});

export const {activitiesReceived, activitySelected, activityRemoved} =
	activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;

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
			const localActivities = Object.values(state.activities).filter(
				(activity) => activity.id < 0,
			);
			state.activities = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				Object.fromEntries(
					localActivities.map((activity) => [activity.id, activity]),
				),
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
		activityUpdated: (state, {payload: activity}: PayloadAction<Activity>) => {
			state.activities[activity.id] = activity;
		},
		activityCreated: (state, {payload: activity}: PayloadAction<Activity>) => {
			state.activities[activity.id] = activity;
		},
		activitySynced: (
			state,
			{
				payload: {localId, activity},
			}: PayloadAction<{localId: number; activity: Activity}>,
		) => {
			delete state.activities[localId];
			state.activities[activity.id] = activity;
			if (state.selectedActivityId === localId) {
				state.selectedActivityId = activity.id;
			}
		},
	},
});

export const {
	activitiesReceived,
	activitySelected,
	activityRemoved,
	activityUpdated,
	activityCreated,
	activitySynced,
} = activitiesSlice.actions;
export const activitiesReducer = activitiesSlice.reducer;

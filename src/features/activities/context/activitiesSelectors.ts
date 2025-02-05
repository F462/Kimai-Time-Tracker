import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectActivitiesState = (state: RootState) => state.activities;

export const selectActivities = createSelector(
	[selectActivitiesState],
	activities => activities.activities
);

export const selectActivityList = createSelector(
	[selectActivities],
	activities => Object.values(activities)
);

export const selectSelectedActivityId = createSelector(
	[selectActivitiesState],
	activitiesState => activitiesState.selectedActivityId
);

export const selectSelectedActivity = createSelector(
	[selectActivities, selectSelectedActivityId],
	(activities, selectedActivityId) =>
		selectedActivityId !== undefined
			? activities[selectedActivityId]
			: undefined
);

const selectActivity = (activityId: number | undefined) =>
	createSelector([selectActivities], activities =>
		activityId ? activities[activityId] : undefined
	);

export const selectActivityName = (activityId: number | undefined) =>
	createSelector([selectActivity(activityId)], activity => activity?.name);

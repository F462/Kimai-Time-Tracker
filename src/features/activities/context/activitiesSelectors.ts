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

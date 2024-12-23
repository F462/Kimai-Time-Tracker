import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectActivities = (state: RootState) => state.activities;

export const selectActivityList = createSelector(
	[selectActivities],
	activities => activities.activityList
);

import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';
import {selectSelectedActivityId} from 'src/features/activities/context/activitiesSelectors';
import {selectSelectedProjectId} from 'src/features/projects/context/projectsSelectors';

const selectActiveTimesheetState = (state: RootState) => state.activeTimesheet;

export const selectCanTimesheetBeStarted = createSelector(
	[selectSelectedProjectId, selectSelectedActivityId],
	(selectedProjectId, selectedActivityId) =>
		selectedProjectId !== undefined && selectedActivityId !== undefined,
);

export const selectActiveTimesheetId = createSelector(
	[selectActiveTimesheetState],
	(activeTimesheetState) => activeTimesheetState.activeTimesheetId,
);

export const selectNextTimesheetStartDate = createSelector(
	[selectActiveTimesheetState],
	(activeTimesheetState) => activeTimesheetState.nextTimesheetStartDatetime,
);

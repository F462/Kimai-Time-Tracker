import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectProjects = (state: RootState) => state.projects;

export const selectProjectList = createSelector(
	[selectProjects],
	projects => projects.projectList
);

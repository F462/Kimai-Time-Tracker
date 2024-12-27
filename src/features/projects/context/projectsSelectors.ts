import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectProjectsState = (state: RootState) => state.projects;

export const selectProjects = createSelector(
	[selectProjectsState],
	projects => projects.projects
);

export const selectProjectList = createSelector([selectProjects], projects =>
	Object.values(projects)
);

export const selectSelectedProjectId = createSelector(
	[selectProjectsState],
	projectState => projectState.selectedProjectId
);

export const selectSelectedProject = createSelector(
	[selectProjects, selectSelectedProjectId],
	(projects, selectedProjectId) =>
		selectedProjectId !== undefined ? projects[selectedProjectId] : undefined
);

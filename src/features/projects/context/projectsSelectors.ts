import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectProjectsState = (state: RootState) => state.projects;

const selectProjects = createSelector(
	[selectProjectsState],
	(projects) => projects.projects
);

export const selectProjectList = createSelector([selectProjects], (projects) =>
	Object.values(projects)
);

export const selectSelectedProjectId = createSelector(
	[selectProjectsState],
	(projectState) => projectState.selectedProjectId
);

export const selectSelectedProject = createSelector(
	[selectProjects, selectSelectedProjectId],
	(projects, selectedProjectId) =>
		selectedProjectId !== undefined ? projects[selectedProjectId] : undefined
);

const selectProject = (projectId: number | undefined) =>
	createSelector([selectProjects], (projects) =>
		projectId ? projects[projectId] : undefined
	);

export const selectProjectName = (projectId: number | undefined) =>
	createSelector([selectProject(projectId)], (project) => project?.name);

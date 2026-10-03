import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Project, ProjectsState} from '../types';

const initialState: ProjectsState = {
	projects: {},
	selectedProjectId: undefined,
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		projectsReceived: (state, {payload}: PayloadAction<Array<Project>>) => {
			state.projects = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				{},
			);
		},
		projectSelected: (
			state,
			{payload: projectId}: PayloadAction<number | undefined>,
		) => {
			state.selectedProjectId = projectId;
		},
		projectRemoved: (state, {payload: projectId}: PayloadAction<number>) => {
			delete state.projects[projectId];

			if (state.selectedProjectId === projectId) {
				state.selectedProjectId = undefined;
			}
		},
		projectUpdated: (state, {payload: project}: PayloadAction<Project>) => {
			state.projects[project.id] = project;
		},
	},
});

export const {
	projectsReceived,
	projectSelected,
	projectRemoved,
	projectUpdated,
} = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

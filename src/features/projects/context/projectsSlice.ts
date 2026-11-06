import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {customerSynced} from 'src/features/customers/context/customersSlice';
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
			const localProjects = Object.values(state.projects).filter(
				(project) => project.id < 0,
			);
			state.projects = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				Object.fromEntries(
					localProjects.map((project) => [project.id, project]),
				),
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
		projectCreated: (state, {payload: project}: PayloadAction<Project>) => {
			state.projects[project.id] = project;
		},
		projectSynced: (
			state,
			{
				payload: {localId, project},
			}: PayloadAction<{localId: number; project: Project}>,
		) => {
			delete state.projects[localId];
			state.projects[project.id] = project;
			if (state.selectedProjectId === localId) {
				state.selectedProjectId = project.id;
			}
		},
	},
	extraReducers: (builder) => {
		builder.addCase(customerSynced, (state, {payload: {localId, customer}}) => {
			for (const project of Object.values(state.projects)) {
				if (project.customer === localId) {
					project.customer = customer.id;
					project.parentTitle = customer.name;
				}
			}
		});
	},
});

export const {
	projectsReceived,
	projectSelected,
	projectRemoved,
	projectUpdated,
	projectCreated,
	projectSynced,
} = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

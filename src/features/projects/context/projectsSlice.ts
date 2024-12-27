import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Project, ProjectsState} from '../types';

const initialState: ProjectsState = {
	projects: {},
	selectedProjectId: undefined
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		projectsReceived: (state, {payload}: PayloadAction<Array<Project>>) => {
			state.projects = payload.reduce(
				(container, element) => ({...container, [element.id]: element}),
				{}
			);
		},
		projectSelected: (
			state,
			{payload: projectId}: PayloadAction<number | undefined>
		) => {
			state.selectedProjectId = projectId;
		}
	}
});

export const {projectsReceived, projectSelected} = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {Project, ProjectsState} from '../types';

const initialState: ProjectsState = {
	projects: {}
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
		}
	}
});

export const {projectsReceived} = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

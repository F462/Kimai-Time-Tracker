import {PayloadAction, createSlice} from '@reduxjs/toolkit';
import {ProjectsState} from '../types';

const initialState: ProjectsState = {
	projectList: []
};

const projectsSlice = createSlice({
	name: 'projects',
	initialState,
	reducers: {
		projectsReceived: (
			state,
			{payload}: PayloadAction<ProjectsState['projectList']>
		) => {
			state.projectList = payload;
		}
	}
});

export const {projectsReceived} = projectsSlice.actions;
export const projectsReducer = projectsSlice.reducer;

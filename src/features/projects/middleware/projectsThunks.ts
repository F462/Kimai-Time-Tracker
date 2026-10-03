import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {projectRemoved, projectsReceived} from '../context/projectsSlice';
import {Project} from '../types';

export const fetchProjects = createAppAsyncThunk(
	'Projects/fetchProjects',
	async (_, {dispatch}) => {
		try {
			const response = await api.get<Array<Project>>('api/projects');
			dispatch(projectsReceived(response));
		} catch (error: any) {
			console.warn(`Got error on fetch request: ${error.toString()}`);
		}
	},
);

export const removeProject = createAppAsyncThunk<void, number>(
	'Projects/removeProject',
	async (projectId, {dispatch}) => {
		try {
			await api.delete(`api/projects/${projectId.toString()}`);
			dispatch(projectRemoved(projectId));
		} catch (error: any) {
			console.warn(`Got error on delete request: ${error.toString()}`);
		}
	},
);

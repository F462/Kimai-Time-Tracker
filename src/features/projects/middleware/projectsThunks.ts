import axios from 'axios';
import path from 'path';

import {Project} from '../types';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {projectsReceived} from '../context/projectsSlice';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

export const fetchProjects = createAppAsyncThunk(
	'Projects/fetchProjects',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Project>>(
				path.join(serverUrl, 'api/projects')
			);
			dispatch(projectsReceived(response.data));
		} catch (error: any) {
			console.warn(`Got error on axios request: ${error.toString()}`);
		}
	}
);

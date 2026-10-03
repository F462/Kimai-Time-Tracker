import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	projectCreated,
	projectRemoved,
	projectsReceived,
	projectUpdated,
} from '../context/projectsSlice';
import {Project} from '../types';

export type CreateProjectPayload = {
	name: string;
	customer: number;
	number?: string | null;
	comment?: string | null;
	visible?: boolean;
	billable?: boolean;
};

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

export const updateProject = createAppAsyncThunk(
	'Projects/updateProject',
	async (project: Project, {dispatch}) => {
		try {
			const response = await api.patch<Project>(
				`api/projects/${project.id.toString()}`,
				{
					name: project.name,
					number: project.number,
					comment: project.comment,
					visible: project.visible,
					billable: project.billable,
				},
			);
			dispatch(projectUpdated(response));
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
		}
	},
);

export const createProject = createAppAsyncThunk<Project, CreateProjectPayload>(
	'Projects/createProject',
	async (payload, {dispatch}) => {
		const body: Record<string, unknown> = {
			name: payload.name,
			customer: payload.customer,
		};

		if (payload.number !== undefined && payload.number !== null) {
			body.number = payload.number;
		}

		if (payload.comment !== undefined && payload.comment !== null) {
			body.comment = payload.comment;
		}

		body.visible = payload.visible ?? true;
		body.billable = payload.billable ?? true;

		const response = await api.post<Project>('api/projects', body);
		dispatch(projectCreated(response));

		return response;
	},
);

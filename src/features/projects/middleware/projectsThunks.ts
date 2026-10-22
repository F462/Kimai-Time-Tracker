import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	projectCreated,
	projectRemoved,
	projectsReceived,
	projectUpdated,
} from '../context/projectsSlice';
import {Project} from '../types';

/** A team, as returned by `GET /api/teams` and used to restrict a project. */
export type Team = {
	id: number;
	name: string;
	color?: string | null;
};

export type CreateProjectPayload = {
	name: string;
	customer: number;
	number?: string | null;
	comment?: string | null;
	visible?: boolean;
	billable?: boolean;
	globalActivities?: boolean;
	color?: string | null;
	/** `YYYY-MM-DD` or null. */
	start?: string | null;
	/** `YYYY-MM-DD` or null. */
	end?: string | null;
	/** `YYYY-MM-DD` or null. */
	lockedUntil?: string | null;
	/** Monetary budget. */
	budget?: number | null;
	/** Time budget in seconds. */
	timeBudget?: number | null;
	/** `month` for a monthly budget, null for the default life-cycle budget. */
	budgetType?: string | null;
	/** Order number shown on invoices. */
	orderNumber?: string | null;
	/** Order date, `YYYY-MM-DD` or null. */
	orderDate?: string | null;
	/** Text used in invoice documents. */
	invoiceText?: string | null;
	/** Team ids allowed to access the project (create only). */
	teams?: Array<number>;
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
			throw error;
		}
	},
);

/**
 * Fetch the teams the current user may assign to a project. Used by the
 * project modal to populate the "Team" multi-select.
 */
export const fetchTeams = createAppAsyncThunk('Projects/fetchTeams', async () =>
	api.get<Array<Team>>('api/teams'),
);

export const updateProject = createAppAsyncThunk(
	'Projects/updateProject',
	async (project: Project, {dispatch}) => {
		try {
			const body: Record<string, unknown> = {
				name: project.name,
				number: project.number,
				comment: project.comment,
				visible: project.visible,
				billable: project.billable,
				globalActivities: project.globalActivities,
				color: project.color,
				start: project.start,
				end: project.end,
				lockedUntil: project.lockedUntil,
				orderNumber: project.orderNumber,
				orderDate: project.orderDate,
				// Budget fields round-trip through the API, so they are always
				// sent (even as zero / null) to allow clearing them.
				budget: project.budget ?? 0,
				timeBudget: project.timeBudget ?? 0,
				budgetType: project.budgetType,
				// `invoiceText` is not returned by the API, so it is only sent
				// when it carries a value – otherwise a PATCH would wipe the
				// existing text we were unable to read back.
				...(project.invoiceText ? {invoiceText: project.invoiceText} : {}),
			};
			const response = await api.patch<Project>(
				`api/projects/${project.id.toString()}`,
				body,
			);
			dispatch(projectUpdated(response));
			return response;
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
			throw error;
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
		body.globalActivities = payload.globalActivities ?? true;

		if (payload.color) {
			body.color = payload.color;
		}

		if (payload.start) {
			body.start = payload.start;
		}

		if (payload.end) {
			body.end = payload.end;
		}

		if (payload.lockedUntil) {
			body.lockedUntil = payload.lockedUntil;
		}

		if (payload.orderNumber) {
			body.orderNumber = payload.orderNumber;
		}

		if (payload.orderDate) {
			body.orderDate = payload.orderDate;
		}

		if (payload.invoiceText) {
			body.invoiceText = payload.invoiceText;
		}

		if (payload.budget) {
			body.budget = payload.budget;
		}

		if (payload.timeBudget) {
			body.timeBudget = payload.timeBudget;
		}

		if (payload.budgetType) {
			body.budgetType = payload.budgetType;
		}

		if (payload.teams && payload.teams.length > 0) {
			body.teams = payload.teams;
		}

		const response = await api.post<Project>('api/projects', body);
		dispatch(projectCreated(response));

		return response;
	},
);

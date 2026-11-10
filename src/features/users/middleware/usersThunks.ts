import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {userCreated, usersReceived, userUpdated} from '../context/usersSlice';
import {User} from '../types';

export type CreateUserPayload = {
	username: string;
	email: string;
	plainPassword: string;
	language: string;
	locale: string;
	timezone: string;
	alias?: string;
	title?: string;
	accountNumber?: string;
	color?: string;
	supervisor?: number;
	roles?: Array<string>;
	plainApiToken?: string;
	enabled?: boolean;
	systemAccount?: boolean;
	requiresPasswordReset?: boolean;
	teams?: Array<number>;
};

export type UpdateUserPayload = {
	id: number;
	alias?: string;
	title?: string;
	accountNumber?: string;
	color?: string | null;
	email?: string;
	language?: string;
	locale?: string;
	timezone?: string;
	supervisor?: number | null;
	roles?: Array<string>;
	enabled?: boolean;
	teams?: Array<number>;
};

export type UserTeam = {
	id: number;
	name: string;
	color?: string | null;
};

const syncUserTeams = async (
	userId: number,
	previousTeams: Array<number>,
	nextTeams: Array<number>,
) => {
	const removedTeams = previousTeams.filter(
		(teamId) => !nextTeams.includes(teamId),
	);
	const addedTeams = nextTeams.filter(
		(teamId) => !previousTeams.includes(teamId),
	);

	await Promise.all([
		...removedTeams.map((teamId) =>
			api.delete(`api/teams/${teamId}/members/${userId}`),
		),
		...addedTeams.map((teamId) =>
			api.post(`api/teams/${teamId}/members/${userId}`),
		),
	]);
};

export const fetchUserTeams = createAppAsyncThunk(
	'users/fetchUserTeams',
	async () => api.get<Array<UserTeam>>('api/teams'),
);

export const fetchUsers = createAppAsyncThunk(
	'users/fetchUsers',
	async (_, {dispatch}) => {
		try {
			const response = await api.get<Array<User>>('api/users?full=1');
			dispatch(usersReceived(response));
		} catch (error: any) {
			console.warn(`Got error on fetch request: ${error.toString()}`);
		}
	},
);

export const createUser = createAppAsyncThunk<User, CreateUserPayload>(
	'users/createUser',
	async (payload, {dispatch}) => {
		try {
			const {teams = [], ...userPayload} = payload;
			const response = await api.post<User>('api/users', userPayload);
			dispatch(userCreated(response));
			await syncUserTeams(response.id, [], teams);
			if (teams.length > 0) {
				await dispatch(fetchUsers());
			}
			return response;
		} catch (error: any) {
			console.warn(`Got error on create request: ${error.toString()}`);
			throw error;
		}
	},
);

export const updateUser = createAppAsyncThunk<User, UpdateUserPayload>(
	'users/updateUser',
	async ({id, teams, ...payload}, {dispatch, getState}) => {
		try {
			const existingUser = getState().users.users[id];
			const previousTeams =
				existingUser?.memberships?.map((membership) => membership.team.id) ??
				existingUser?.teams?.map((team) => team.id) ??
				[];
			const updatePayload = {...payload};
			if (updatePayload.enabled !== undefined) {
				try {
					const currentUser = await api.get<{id: number} | undefined>(
						'api/users/me',
					);
					if (currentUser?.id === id) {
						delete updatePayload.enabled;
					}
				} catch {
					// Continue with the supplied fields if the current user cannot be read.
				}
			}
			const response = await api.patch<User>(
				`api/users/${id.toString()}`,
				updatePayload,
			);
			dispatch(userUpdated(response));
			if (teams !== undefined) {
				await syncUserTeams(id, previousTeams, teams);
			}
			if (teams !== undefined) {
				await dispatch(fetchUsers());
			}
			return response;
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
			throw error;
		}
	},
);

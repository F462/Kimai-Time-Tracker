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
};

export type UpdateUserPayload = {
	id: number;
	alias?: string;
	title?: string;
	accountNumber?: string;
	color?: string;
	email?: string;
	language?: string;
	locale?: string;
	timezone?: string;
	supervisor?: number;
	roles?: Array<string>;
	enabled?: boolean;
};

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
			const response = await api.post<User>('api/users', payload);
			dispatch(userCreated(response));
			return response;
		} catch (error: any) {
			console.warn(`Got error on create request: ${error.toString()}`);
			throw error;
		}
	},
);

export const updateUser = createAppAsyncThunk<User, UpdateUserPayload>(
	'users/updateUser',
	async ({id, ...payload}, {dispatch}) => {
		try {
			const response = await api.patch<User>(
				`api/users/${id.toString()}`,
				payload,
			);
			dispatch(userUpdated(response));
			return response;
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
			throw error;
		}
	},
);

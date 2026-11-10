import EncryptedStorage from 'react-native-encrypted-storage';

import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	userCreated,
	usersReceived,
	userSynced,
	userUpdated,
	userUpdateQueued,
	userUpdateSynced,
} from '../context/usersSlice';
import {User, UserUpdateChanges} from '../types';

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

export type UpdateUserPayload = UserUpdateChanges & {id: number};

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

const userPasswordKey = (userId: number) => `pending-user-password-${userId}`;

const createLocalUser = (
	payload: CreateUserPayload,
	users: {[id: number]: User},
): User => {
	const localIds = Object.keys(users)
		.map(Number)
		.filter((id) => Number.isInteger(id) && id < 0);
	const id = localIds.length > 0 ? Math.min(...localIds) - 1 : -1;
	const supervisor =
		payload.supervisor !== undefined ? users[payload.supervisor] : undefined;
	const teams = (payload.teams ?? []).map((teamId) => ({id: teamId, name: ''}));

	return {
		id,
		username: payload.username,
		email: payload.email,
		alias: payload.alias,
		title: payload.title,
		accountNumber: payload.accountNumber,
		color: payload.color,
		language: payload.language,
		locale: payload.locale,
		timezone: payload.timezone,
		enabled: payload.enabled ?? true,
		systemAccount: payload.systemAccount ?? false,
		requiresPasswordReset: payload.requiresPasswordReset ?? false,
		roles: payload.roles ?? [],
		supervisor: supervisor
			? {id: supervisor.id, username: supervisor.username}
			: null,
		teams,
		memberships: teams.map((team) => ({team, teamlead: false})),
		preferences: [],
	};
};

const createUserBody = (user: User, plainPassword?: string) => ({
	username: user.username,
	email: user.email,
	...(plainPassword === undefined ? {} : {plainPassword}),
	language: user.language,
	locale: user.locale,
	timezone: user.timezone,
	alias: user.alias,
	title: user.title,
	accountNumber: user.accountNumber,
	color: user.color,
	supervisor: user.supervisor?.id,
	roles: user.roles,
	enabled: user.enabled,
	systemAccount: user.systemAccount,
	requiresPasswordReset: user.requiresPasswordReset,
});

const updateLocalUser = (
	user: User,
	changes: UserUpdateChanges,
	users: {[id: number]: User},
): User => {
	const {supervisor: supervisorId, teams: teamIds, ...userChanges} = changes;
	const updatedUser: User = {...user, ...userChanges};
	if (supervisorId !== undefined) {
		const supervisor = supervisorId === null ? undefined : users[supervisorId];
		updatedUser.supervisor = supervisor
			? {id: supervisor.id, username: supervisor.username}
			: null;
	}
	if (teamIds !== undefined) {
		const currentTeams = new Map(
			[
				...(user.teams ?? []),
				...(user.memberships ?? []).map(({team}) => team),
			].map((team) => [team.id, team]),
		);
		const teams = teamIds.map(
			(teamId) => currentTeams.get(teamId) ?? {id: teamId, name: ''},
		);
		updatedUser.teams = teams;
		updatedUser.memberships = teams.map((team) => ({
			team,
			teamlead:
				user.memberships?.find((membership) => membership.team.id === team.id)
					?.teamlead ?? false,
		}));
	}
	return updatedUser;
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
	async (payload, {dispatch, getState}) => {
		const saveLocally = async () => {
			const user = createLocalUser(payload, getState().users.users);
			await EncryptedStorage.setItem(
				userPasswordKey(user.id),
				payload.plainPassword,
			);
			dispatch(userCreated(user));
			return user;
		};

		if (!api.isConfigured()) {
			return saveLocally();
		}

		try {
			const {teams = [], ...userPayload} = payload;
			const response = await api.post<User>('api/users', userPayload);
			dispatch(userCreated(response));
			if (teams.length > 0) {
				try {
					await syncUserTeams(response.id, [], teams);
					await dispatch(fetchUsers());
				} catch (error: any) {
					dispatch(
						userUpdateQueued({
							userId: response.id,
							changes: {teams},
							previousTeams: [],
						}),
					);
					console.warn(`Could not synchronize user teams: ${error.toString()}`);
				}
			}
			return response;
		} catch (error: any) {
			if (error?.status === undefined) {
				return saveLocally();
			}
			console.warn(`Got error on create request: ${error.toString()}`);
			throw error;
		}
	},
);

export const updateUser = createAppAsyncThunk<User, UpdateUserPayload>(
	'users/updateUser',
	async ({id, teams, ...payload}, {dispatch, getState}) => {
		const state = getState().users;
		const existingUser = state.users[id];
		const pendingUpdate = state.pendingUpdates?.[id];
		const previousTeams =
			pendingUpdate?.previousTeams ??
			existingUser?.memberships?.map((membership) => membership.team.id) ??
			existingUser?.teams?.map((team) => team.id) ??
			[];
		const changes = {
			...pendingUpdate?.changes,
			...payload,
			...(teams !== undefined ? {teams} : {}),
		};
		const saveLocally = () => {
			if (!existingUser) {
				throw new Error('Cannot update a user that is not available locally.');
			}
			const updatedUser = updateLocalUser(existingUser, changes, state.users);
			dispatch(userUpdated(updatedUser));
			if (id >= 0) {
				dispatch(userUpdateQueued({userId: id, changes, previousTeams}));
			}
			return updatedUser;
		};

		if (id < 0 || !api.isConfigured()) {
			return saveLocally();
		}

		try {
			const {teams: teamsToSync, ...updatePayload} = changes;
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
			if (teamsToSync !== undefined) {
				await syncUserTeams(id, previousTeams, teamsToSync);
			}
			if (teamsToSync !== undefined) {
				await dispatch(fetchUsers());
			}
			dispatch(userUpdateSynced(id));
			return response;
		} catch (error: any) {
			if (error?.status === undefined) {
				return saveLocally();
			}
			console.warn(`Got error on update request: ${error.toString()}`);
			throw error;
		}
	},
);

export const synchronizeLocalUsers = createAppAsyncThunk(
	'users/synchronizeLocalUsers',
	async (_, {dispatch, getState}) => {
		if (!api.isConfigured()) {
			return;
		}

		const localUsers = Object.values(getState().users.users)
			.filter((user) => user.id < 0)
			.sort((first, second) => first.id - second.id);

		for (const user of localUsers) {
			try {
				const plainPassword = await EncryptedStorage.getItem(
					userPasswordKey(user.id),
				);
				if (plainPassword === null) {
					continue;
				}
				const response = await api.post<User>(
					'api/users',
					createUserBody(user, plainPassword),
				);
				dispatch(userSynced({localId: user.id, user: response}));
				await EncryptedStorage.removeItem(userPasswordKey(user.id)).catch(
					(error: unknown) =>
						console.warn(
							`Could not clear synced user credential: ${String(error)}`,
						),
				);
				const teamIds = user.teams?.map((team) => team.id) ?? [];
				if (teamIds.length > 0) {
					try {
						await syncUserTeams(response.id, [], teamIds);
					} catch (error: any) {
						dispatch(
							userUpdateQueued({
								userId: response.id,
								changes: {teams: teamIds},
								previousTeams: [],
							}),
						);
						console.warn(
							`Could not synchronize local user teams: ${error.toString()}`,
						);
					}
				}
			} catch (error: any) {
				console.warn(`Could not synchronize local user: ${error.toString()}`);
			}
		}

		const pendingUpdates = Object.entries(
			getState().users.pendingUpdates ?? {},
		);
		for (const [userIdString, pending] of pendingUpdates) {
			const userId = Number(userIdString);
			const {teams, ...updatePayload} = pending.changes;
			try {
				if (updatePayload.enabled !== undefined) {
					try {
						const currentUser = await api.get<{id: number} | undefined>(
							'api/users/me',
						);
						if (currentUser?.id === userId) {
							delete updatePayload.enabled;
						}
					} catch {
						// Continue with the queued fields if the current user cannot be read.
					}
				}
				const response = await api.patch<User>(
					`api/users/${userId.toString()}`,
					updatePayload,
				);
				if (teams !== undefined) {
					await syncUserTeams(userId, pending.previousTeams, teams);
				}
				dispatch(userUpdated(response));
				dispatch(userUpdateSynced(userId));
			} catch (error: any) {
				console.warn(`Could not synchronize user update: ${error.toString()}`);
			}
		}
	},
);

import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {User, UsersState} from '../types';

const initialState: UsersState = {
	users: {},
	pendingUpdates: {},
	selectedUserId: undefined,
};

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		usersReceived: (state, {payload}: PayloadAction<Array<User>>) => {
			const preservedUsers = Object.values(state.users).filter(
				(user) => user.id < 0 || state.pendingUpdates?.[user.id] !== undefined,
			);
			state.users = {
				...Object.fromEntries(payload.map((user) => [user.id, user])),
				...Object.fromEntries(preservedUsers.map((user) => [user.id, user])),
			};
		},
		userSelected: (
			state,
			{payload: userId}: PayloadAction<number | undefined>,
		) => {
			state.selectedUserId = userId;
		},
		userUpdated: (state, {payload: user}: PayloadAction<User>) => {
			state.users[user.id] = user;
		},
		userCreated: (state, {payload: user}: PayloadAction<User>) => {
			state.users[user.id] = user;
		},
		userUpdateQueued: (
			state,
			{
				payload: {userId, changes, originalValues, previousTeams},
			}: PayloadAction<{
				userId: number;
				changes: UsersState['pendingUpdates'][number]['changes'];
				originalValues: UsersState['pendingUpdates'][number]['originalValues'];
				previousTeams: Array<number>;
			}>,
		) => {
			state.pendingUpdates ??= {};
			const existing = state.pendingUpdates[userId];
			state.pendingUpdates[userId] = {
				changes: {...existing?.changes, ...changes},
				originalValues: {...existing?.originalValues, ...originalValues},
				previousTeams: existing?.previousTeams ?? previousTeams,
			};
		},
		userUpdateSynced: (state, {payload: userId}: PayloadAction<number>) => {
			if (state.pendingUpdates) {
				delete state.pendingUpdates[userId];
			}
		},
		userSynced: (
			state,
			{payload: {localId, user}}: PayloadAction<{localId: number; user: User}>,
		) => {
			delete state.users[localId];
			state.users[user.id] = user;
			if (state.selectedUserId === localId) {
				state.selectedUserId = user.id;
			}
		},
	},
});

export const {
	usersReceived,
	userSelected,
	userUpdated,
	userCreated,
	userUpdateQueued,
	userUpdateSynced,
	userSynced,
} = usersSlice.actions;
export const usersReducer = usersSlice.reducer;

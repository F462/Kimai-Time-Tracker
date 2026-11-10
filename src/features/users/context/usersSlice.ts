import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {User, UsersState} from '../types';

const initialState: UsersState = {
	users: {},
	selectedUserId: undefined,
};

const usersSlice = createSlice({
	name: 'users',
	initialState,
	reducers: {
		usersReceived: (state, {payload}: PayloadAction<Array<User>>) => {
			state.users = Object.fromEntries(payload.map((user) => [user.id, user]));
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
	},
});

export const {usersReceived, userSelected, userUpdated, userCreated} =
	usersSlice.actions;
export const usersReducer = usersSlice.reducer;

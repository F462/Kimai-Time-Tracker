import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectUsersState = (state: RootState) => state.users;

export const selectUsers = createSelector(
	[selectUsersState],
	(users) => users.users,
);

export const selectUserList = createSelector([selectUsers], (users) =>
	Object.values(users),
);

export const selectSelectedUserId = createSelector(
	[selectUsersState],
	(users) => users.selectedUserId,
);

export const selectSelectedUser = createSelector(
	[selectUsers, selectSelectedUserId],
	(users, selectedUserId) =>
		selectedUserId !== undefined ? users[selectedUserId] : undefined,
);

export const selectUser = (userId: number | undefined) =>
	createSelector([selectUsers], (users) =>
		userId !== undefined ? users[userId] : undefined,
	);

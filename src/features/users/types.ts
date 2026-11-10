export type UserReference = {
	id: number;
	username: string;
	alias?: string | null;
	color?: string | null;
};

export type UserTeam = {
	id: number;
	name: string;
	color?: string | null;
};

export type UserMembership = {
	team: UserTeam;
	teamlead: boolean;
};

export type UserPreference = {
	name: string;
	value: string | null;
};

export type UserUpdateChanges = {
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

export type PendingUserUpdate = {
	changes: UserUpdateChanges;
	previousTeams: Array<number>;
};

export type User = {
	id: number;
	username: string;
	email: string;
	alias?: string | null;
	title?: string | null;
	accountNumber?: string | null;
	color?: string | null;
	'color-safe'?: string;
	language?: string;
	locale?: string;
	timezone?: string;
	initials?: string;
	avatar?: string | null;
	enabled?: boolean;
	systemAccount?: boolean;
	roles?: Array<string>;
	requiresPasswordReset?: boolean;
	supervisor?: UserReference | null;
	teams?: Array<UserTeam>;
	memberships?: Array<UserMembership>;
	preferences?: Array<UserPreference>;
};

export type UsersState = {
	users: {[id: number]: User};
	pendingUpdates: {[id: number]: PendingUserUpdate};
	selectedUserId: number | undefined;
};

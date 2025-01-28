export enum SyncState {
	NOT_STARTED,
	RUNNING,
	DONE,
	FAILED
}

export type SynchronizationState = {
	timesheets: {
		[id: string]: SyncState;
	};
};

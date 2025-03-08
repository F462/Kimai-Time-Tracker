import {SyncState} from '../types';

export const isTimesheetSyncNeeded = (syncState: SyncState) =>
	[SyncState.NOT_STARTED, SyncState.FAILED].includes(syncState);

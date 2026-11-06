import {backupDataImported} from 'src/features/backup/context/backupActions';
import type {BackupData} from 'src/features/backup/types';
import {rootReducer} from 'src/features/data/context/store';
import {SyncState} from 'src/features/synchronization/types';

describe('backup restore reducer', () => {
	it('replaces backed-up slices and clears transient sync state', () => {
		const initialState = rootReducer(undefined, {type: 'test/initialize'});
		const importedData = {
			...initialState,
			account: {serverUrl: 'https://restored.example.com'},
			synchronization: {
				timesheets: {'restored-id': SyncState.RUNNING},
				errors: {},
			},
			settings: {
				...initialState.settings,
				workContractHoursSyncWaiting: true,
				workContractHoursSyncInProgress: true,
			},
		} satisfies BackupData;

		const restoredState = rootReducer(
			initialState,
			backupDataImported(importedData),
		);

		expect(restoredState.account.serverUrl).toBe(
			'https://restored.example.com',
		);
		expect(restoredState.overview).toBeNull();
		expect(restoredState.synchronization.timesheets['restored-id']).toBe(
			SyncState.NOT_STARTED,
		);
		expect(restoredState.settings.workContractHoursSyncWaiting).toBe(false);
		expect(restoredState.settings.workContractHoursSyncInProgress).toBe(false);
	});
});

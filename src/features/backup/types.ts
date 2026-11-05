import type {RootState} from 'src/features/data/context/store';

/**
 * The slices of application data that are included in a backup.
 *
 * This intentionally mirrors the state that is persisted by redux-persist, so
 * a backup can be used to restore the app's data. Transient or derived slices
 * (`appState`, `network`, `overview`) are excluded on purpose.
 */
export type BackupData = Pick<
	RootState,
	| 'account'
	| 'activeTimesheet'
	| 'activities'
	| 'customers'
	| 'onboarding'
	| 'projects'
	| 'settings'
	| 'synchronization'
	| 'timesheets'
>;

export type BackupPayload = {
	app: {
		name: string;
		version: string;
		build: string;
	};
	/** ISO-8601 timestamp of when the backup was created. */
	exportedAt: string;
	device: {
		model: string;
		os: string;
		osVersion: string;
	};
	data: BackupData;
};

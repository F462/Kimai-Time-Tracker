import type {AccountState} from 'src/features/account/types';
import type {ActiveTimesheetState} from 'src/features/activeTimesheet/types';
import type {ActivitiesState} from 'src/features/activities/types';
import type {CustomersState} from 'src/features/customers/types';
import type {NfcState} from 'src/features/nfc/types';
import type {OnboardingState} from 'src/features/onboarding/types';
import type {ProjectsState} from 'src/features/projects/types';
import type {SettingsState} from 'src/features/settings/types';
import type {SynchronizationState} from 'src/features/synchronization/types';
import type {TimesheetsState} from 'src/features/timesheets/types';

/**
 * The slices of application data that are included in a backup.
 *
 * This intentionally mirrors the state that is persisted by redux-persist, so
 * a backup can be used to restore the app's data. Transient or derived slices
 * (`appState`, `network`, `overview`) are excluded on purpose.
 */
export type BackupData = {
	account: AccountState;
	activeTimesheet: ActiveTimesheetState;
	activities: ActivitiesState;
	customers: CustomersState;
	nfc: NfcState;
	onboarding: OnboardingState;
	projects: ProjectsState;
	settings: SettingsState;
	synchronization: SynchronizationState;
	timesheets: TimesheetsState;
};

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

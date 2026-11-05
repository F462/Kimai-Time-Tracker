import DeviceInfo from 'react-native-device-info';

import type {RootState} from 'src/features/data/context/store';
import type {BackupData, BackupPayload} from '../types';

/**
 * Extracts the user data slices from the application state that should be
 * included in a backup.
 *
 * This mirrors the state persisted by redux-persist, so the result can be
 * used to restore the app's data.
 */
export const buildBackupData = (state: RootState): BackupData => ({
	account: state.account,
	activeTimesheet: state.activeTimesheet,
	activities: state.activities,
	customers: state.customers,
	onboarding: state.onboarding,
	projects: state.projects,
	settings: state.settings,
	synchronization: state.synchronization,
	timesheets: state.timesheets,
});

/**
 * Builds the complete, serializable backup payload from the application state.
 *
 * The `exportedAt` timestamp can be supplied for deterministic output (e.g. in
 * tests); it defaults to the current point in time.
 */
export const buildBackupPayload = (
	state: RootState,
	exportedAt: string = new Date().toISOString(),
): BackupPayload => ({
	app: {
		name: 'Kimai Time Tracker',
		version: DeviceInfo.getVersion(),
		build: DeviceInfo.getBuildNumber(),
	},
	exportedAt,
	device: {
		model: DeviceInfo.getModel(),
		os: DeviceInfo.getSystemName(),
		osVersion: DeviceInfo.getSystemVersion(),
	},
	data: buildBackupData(state),
});

import {buildBackupPayload} from 'src/features/backup/utils/buildBackupPayload';
import type {RootState} from 'src/features/data/context/store';

jest.mock('react-native-device-info', () => ({
	getVersion: () => '1.2.3',
	getBuildNumber: () => '42',
	getModel: () => 'Test Device',
	getSystemName: () => 'Android',
	getSystemVersion: () => '14',
}));

const makeState = (): RootState =>
	({
		account: {serverUrl: 'https://kimai.example.com'},
		activeTimesheet: {activeTimesheetId: undefined},
		activities: {activities: {7: {id: 7}}, selectedActivityId: 7},
		customers: {customers: {3: {id: 3}}, selectedCustomerId: 3},
		onboarding: {hasDevelopmentWarningBeenShown: true},
		projects: {projects: {5: {id: 5}}, selectedProjectId: 5},
		settings: {appTheme: 'system'},
		synchronization: {},
		timesheets: {
			timesheets: {'ts-1': {id: 'ts-1', begin: '2026-11-05T09:00:00Z'}},
			timesheetIdTable: {'ts-1': 1234},
		},
	}) as unknown as RootState;

describe('buildBackupPayload', () => {
	const exportTimestamp = '2026-11-05T12:00:00.000Z';

	it('includes every persisted data slice', () => {
		const state = makeState();
		const {data} = buildBackupPayload(state, exportTimestamp);

		expect(data.account).toEqual(state.account);
		expect(data.activeTimesheet).toEqual(state.activeTimesheet);
		expect(data.activities).toEqual(state.activities);
		expect(data.customers).toEqual(state.customers);
		expect(data.onboarding).toEqual(state.onboarding);
		expect(data.projects).toEqual(state.projects);
		expect(data.settings).toEqual(state.settings);
		expect(data.synchronization).toEqual(state.synchronization);
		expect(data.timesheets).toEqual(state.timesheets);
	});

	it('excludes the transient and derived slices', () => {
		const {data} = buildBackupPayload(makeState(), exportTimestamp);

		expect(data).not.toHaveProperty('appState');
		expect(data).not.toHaveProperty('network');
		expect(data).not.toHaveProperty('overview');
	});

	it('records the app and device metadata', () => {
		const {
			app,
			device,
			exportedAt: timestamp,
		} = buildBackupPayload(makeState(), exportTimestamp);

		expect(app).toEqual({
			name: 'Kimai Time Tracker',
			version: '1.2.3',
			build: '42',
		});
		expect(device).toEqual({
			model: 'Test Device',
			os: 'Android',
			osVersion: '14',
		});
		expect(timestamp).toBe(exportTimestamp);
	});

	it('defaults the export timestamp to the current time', () => {
		const before = Date.now();
		const {exportedAt} = buildBackupPayload(makeState());
		const after = Date.now();

		const timestamp = new Date(exportedAt).getTime();
		expect(timestamp).toBeGreaterThanOrEqual(before);
		expect(timestamp).toBeLessThanOrEqual(after);
	});
});

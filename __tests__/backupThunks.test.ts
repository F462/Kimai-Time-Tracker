import {configureStore, UnknownAction} from '@reduxjs/toolkit';
import {NativeModules} from 'react-native';

import {backupDataImported} from 'src/features/backup/context/backupActions';
import {
	exportData,
	importData,
	runAutomaticBackupIfDue,
} from 'src/features/backup/middleware/backupThunks';
import {parseBackupPayload} from 'src/features/backup/utils/parseBackupPayload';
import type {AppDispatch, RootState} from 'src/features/data/context/store';
import {settingsReducer} from 'src/features/settings/context/settingsSlice';

const backupState = (settings: RootState['settings']): RootState =>
	({
		account: {},
		activeTimesheet: {},
		activities: {},
		appState: {},
		customers: {},
		network: {},
		onboarding: {},
		overview: {},
		projects: {},
		settings,
		synchronization: {},
		timesheets: {},
	}) as RootState;

const configureTestStore = (
	settings = settingsReducer(undefined, {type: 'init'}),
) =>
	configureStore({
		reducer: (state: RootState = backupState(settings), action) => ({
			...state,
			settings: settingsReducer(state.settings, action),
		}),
	});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('exportData', () => {
	it('sends a JSON backup to the native destination picker', async () => {
		const saveBackup = jest.fn().mockResolvedValue(true);
		NativeModules.WidgetBridge = {saveBackup};
		const store = configureTestStore() as TestStore;

		await store.dispatch(exportData());

		expect(saveBackup).toHaveBeenCalledWith(
			expect.any(String),
			'kimai-backup.json',
		);
		expect(JSON.parse(saveBackup.mock.calls[0][0])).toHaveProperty('data');
		expect(() => parseBackupPayload(saveBackup.mock.calls[0][0])).not.toThrow();
	});
});

describe('importData', () => {
	const validBackup = () =>
		JSON.stringify({
			app: {name: 'Kimai Time Tracker', version: '1.2.3', build: '42'},
			exportedAt: '2026-11-05T12:00:00.000Z',
			device: {model: 'Test Device', os: 'Android', osVersion: '14'},
			data: {
				account: {serverUrl: 'https://kimai.example.com'},
				activeTimesheet: {},
				activities: {activities: {}, selectedActivityId: null},
				customers: {customers: {}, selectedCustomerId: null},
				onboarding: {},
				projects: {projects: {}, selectedProjectId: null},
				settings: settingsReducer(undefined, {type: 'init'}),
				synchronization: {timesheets: {}, errors: {}},
				timesheets: {
					timesheets: {
						'local-1': {id: 'local-1', begin: '2026-11-05T09:00:00Z'},
					},
					timesheetIdTable: {'local-1': 1234},
				},
			},
		});

	it('dispatches validated backup data from the selected file', async () => {
		const chooseBackupFile = jest.fn().mockResolvedValue(validBackup());
		NativeModules.WidgetBridge = {chooseBackupFile};
		const reducer = jest.fn(
			(
				state: RootState = backupState(
					settingsReducer(undefined, {type: 'init'}),
				),
				_action: UnknownAction,
			) => state,
		);
		const store = configureStore({reducer});

		await store.dispatch(importData()).unwrap();

		expect(
			reducer.mock.calls.some(([, action]) => backupDataImported.match(action)),
		).toBe(true);
	});

	it('fills defaults for settings from an older backup', () => {
		const payload = JSON.parse(validBackup());
		payload.data.settings = {
			appTheme: 'dark',
			standardWorkingHoursPerDay: 6,
		};

		const parsed = parseBackupPayload(JSON.stringify(payload));

		expect(parsed.data.settings.appTheme).toBe('dark');
		expect(parsed.data.settings.workContractHoursPerDay).toEqual({
			monday: 6,
			tuesday: 6,
			wednesday: 6,
			thursday: 6,
			friday: 6,
			saturday: 0,
			sunday: 0,
		});
		expect(parsed.data.settings.automaticBackupIntervalDays).toBe(0);
	});

	it('fills missing slices and metadata from an older backup', () => {
		const payload = JSON.parse(validBackup());
		delete payload.app;
		delete payload.device;
		delete payload.data.synchronization;
		delete payload.data.timesheets;

		const parsed = parseBackupPayload(JSON.stringify(payload));

		expect(parsed.app.name).toBe('Kimai Time Tracker');
		expect(parsed.data.synchronization).toEqual({timesheets: {}, errors: {}});
		expect(parsed.data.timesheets).toEqual({
			timesheets: {},
			timesheetIdTable: {},
		});
	});

	it('normalizes legacy entity arrays into keyed state maps', () => {
		const payload = JSON.parse(validBackup());
		payload.data.activities = [{id: 7, name: 'Legacy activity'}];

		const parsed = parseBackupPayload(JSON.stringify(payload));

		expect(parsed.data.activities.activities).toEqual({
			7: {id: 7, name: 'Legacy activity'},
		});
	});

	it('rejects malformed backup files without dispatching restored data', async () => {
		const chooseBackupFile = jest.fn().mockResolvedValue('{"data":{}}');
		NativeModules.WidgetBridge = {chooseBackupFile};
		const reducer = jest.fn(
			(
				state: RootState = backupState(
					settingsReducer(undefined, {type: 'init'}),
				),
				_action: UnknownAction,
			) => state,
		);
		const store = configureStore({reducer});

		const result = await store.dispatch(importData());

		expect(importData.rejected.match(result)).toBe(true);
		if (importData.rejected.match(result)) {
			expect(result.error.message).toContain('supported Kimai backup');
		}

		expect(
			reducer.mock.calls.some(([, action]) => backupDataImported.match(action)),
		).toBe(false);
	});

	it('treats picker cancellation as a no-op', async () => {
		const chooseBackupFile = jest.fn().mockResolvedValue(null);
		NativeModules.WidgetBridge = {chooseBackupFile};
		const store = configureTestStore() as TestStore;

		await expect(store.dispatch(importData()).unwrap()).resolves.toBe(false);
	});
});

describe('runAutomaticBackupIfDue', () => {
	beforeEach(() => {
		jest.restoreAllMocks();
	});

	it('exports and records the completion time when the interval is due', async () => {
		const now = 1_800_000_000_000;
		jest.spyOn(Date, 'now').mockReturnValue(now);
		const saveBackup = jest.fn().mockResolvedValue(true);
		const getBackupFolder = jest.fn().mockResolvedValue(true);
		NativeModules.WidgetBridge = {getBackupFolder, saveBackup};
		const settings = {
			...settingsReducer(undefined, {type: 'init'}),
			automaticBackupIntervalDays: 7 as const,
			lastAutomaticBackupAt: null,
		};
		const store = configureTestStore(settings) as TestStore;

		await store.dispatch(runAutomaticBackupIfDue());

		expect(getBackupFolder).toHaveBeenCalledTimes(1);
		expect(saveBackup).toHaveBeenCalledTimes(1);
		expect(store.getState().settings.lastAutomaticBackupAt).toBe(now);
	});

	it('does not export before the configured interval has elapsed', async () => {
		const getBackupFolder = jest.fn();
		NativeModules.WidgetBridge = {getBackupFolder};
		const settings = {
			...settingsReducer(undefined, {type: 'init'}),
			automaticBackupIntervalDays: 7 as const,
			lastAutomaticBackupAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
		};
		const store = configureTestStore(settings) as TestStore;

		await store.dispatch(runAutomaticBackupIfDue());

		expect(getBackupFolder).not.toHaveBeenCalled();
	});
});

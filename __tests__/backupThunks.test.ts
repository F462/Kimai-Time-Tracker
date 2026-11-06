import {configureStore} from '@reduxjs/toolkit';
import {NativeModules} from 'react-native';

import {
	exportData,
	runAutomaticBackupIfDue,
} from 'src/features/backup/middleware/backupThunks';
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

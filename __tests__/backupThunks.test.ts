import {configureStore} from '@reduxjs/toolkit';
import {NativeModules} from 'react-native';

import {exportData} from 'src/features/backup/middleware/backupThunks';
import type {AppDispatch, RootState} from 'src/features/data/context/store';

const backupState = {
	account: {},
	activeTimesheet: {},
	activities: {},
	appState: {},
	customers: {},
	network: {},
	onboarding: {},
	overview: {},
	projects: {},
	settings: {},
	synchronization: {},
	timesheets: {},
} as RootState;

const configureTestStore = () =>
	configureStore({reducer: (state: RootState = backupState) => state});

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

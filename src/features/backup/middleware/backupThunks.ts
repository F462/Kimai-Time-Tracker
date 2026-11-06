import {NativeModules} from 'react-native';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {buildBackupPayload} from '../utils/buildBackupPayload';

const BACKUP_FILE_NAME = 'kimai-backup.json';

type BackupSaver = {
	chooseBackupFolder: () => Promise<boolean>;
	getBackupFolder: () => Promise<boolean>;
	saveBackup: (contents: string, fileName: string) => Promise<boolean>;
};

const getBackupSaver = () => NativeModules.WidgetBridge as BackupSaver;

export const getBackupFolder = createAppAsyncThunk<boolean, void>(
	'backup/getBackupFolder',
	async () => getBackupSaver().getBackupFolder(),
);

export const chooseBackupFolder = createAppAsyncThunk<boolean, void>(
	'backup/chooseBackupFolder',
	async () => getBackupSaver().chooseBackupFolder(),
);

/**
 * Exports the app data as a JSON file to a location selected by the user.
 */
export const exportData = createAppAsyncThunk<void, void>(
	'backup/exportData',
	async (_payload, {getState}) => {
		console.info('Exporting app data');

		const payload = buildBackupPayload(getState());
		const saved = await getBackupSaver().saveBackup(
			JSON.stringify(payload, null, 2),
			BACKUP_FILE_NAME,
		);

		if (saved) {
			console.info('App data backup saved');
		}
	},
);

import {NativeModules} from 'react-native';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {automaticBackupCompleted} from 'src/features/settings/context/settingsSlice';
import {buildBackupPayload} from '../utils/buildBackupPayload';

const BACKUP_FILE_NAME = 'kimai-backup.json';

type BackupSaver = {
	chooseBackupFolder: () => Promise<boolean>;
	getBackupFolder: () => Promise<boolean>;
	getBackupFolderPath: () => Promise<string | null>;
	saveBackup: (contents: string, fileName: string) => Promise<boolean>;
};

const getBackupSaver = () => NativeModules.WidgetBridge as BackupSaver;
let isAutomaticBackupInProgress = false;

export const getBackupFolder = createAppAsyncThunk<boolean, void>(
	'backup/getBackupFolder',
	async () => getBackupSaver().getBackupFolder(),
);

export const getBackupFolderPath = createAppAsyncThunk<string | null, void>(
	'backup/getBackupFolderPath',
	async () => getBackupSaver().getBackupFolderPath(),
);

export const chooseBackupFolder = createAppAsyncThunk<boolean, void>(
	'backup/chooseBackupFolder',
	async () => getBackupSaver().chooseBackupFolder(),
);

/**
 * Exports the app data as a JSON file to a location selected by the user.
 */
export const exportData = createAppAsyncThunk<boolean, void>(
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
		return saved;
	},
);

export const runAutomaticBackupIfDue = createAppAsyncThunk<void, void>(
	'backup/runAutomaticBackupIfDue',
	async (_payload, {dispatch, getState}) => {
		const {automaticBackupIntervalDays, lastAutomaticBackupAt} =
			getState().settings;
		if (
			!automaticBackupIntervalDays ||
			isAutomaticBackupInProgress ||
			(lastAutomaticBackupAt !== null &&
				Date.now() - lastAutomaticBackupAt <
					automaticBackupIntervalDays * 24 * 60 * 60 * 1000)
		) {
			return;
		}

		isAutomaticBackupInProgress = true;
		try {
			if (!(await getBackupSaver().getBackupFolder())) {
				return;
			}

			const saved = await dispatch(exportData()).unwrap();
			if (saved) {
				dispatch(automaticBackupCompleted(Date.now()));
			}
		} finally {
			isAutomaticBackupInProgress = false;
		}
	},
);

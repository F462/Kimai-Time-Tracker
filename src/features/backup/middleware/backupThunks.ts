import path from 'path';
import ReactNativeBlobUtil from 'react-native-blob-util';
import Share from 'react-native-share';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {removeFile} from 'src/features/fileHandling/utils/removeFile';
import {buildBackupPayload} from '../utils/buildBackupPayload';

const BACKUP_FILE_NAME = 'kimai-backup.json';

/**
 * Exports the app data as a JSON file and opens the system share sheet so the
 * user can store it (e.g. in the cloud, via e-mail, or on a computer) as a
 * backup.
 *
 * The temporary file is removed again as soon as the share sheet has been
 * dismissed.
 */
export const exportData = createAppAsyncThunk<void, void>(
	'backup/exportData',
	async (_payload, {getState}) => {
		console.info('Exporting app data');

		const payload = buildBackupPayload(getState());

		const backupFilePath = path.join(
			ReactNativeBlobUtil.fs.dirs.CacheDir,
			BACKUP_FILE_NAME,
		);

		await ReactNativeBlobUtil.fs.writeFile(
			backupFilePath,
			JSON.stringify(payload, null, 2),
			'utf8',
		);

		try {
			await Share.open({
				url: `file://${backupFilePath}`,
				title: 'Kimai Time Tracker backup',
				type: 'application/json',
				filename: BACKUP_FILE_NAME,
			});
		} catch (error: any) {
			// Dismissing the share sheet is not a failure of the export itself.
			console.warn(
				`Sharing the backup failed or was cancelled: ${error.toString()}`,
			);
		} finally {
			await removeFile(backupFilePath);
		}
	},
);

import Share from 'react-native-share';
import path from 'path';
import {zip} from 'react-native-zip-archive';

import {LOGS_DIRECTORY} from '../utils/initialization';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {removeFile} from 'src/features/fileHandling/utils/removeFile';

export const exportLogs = createAppAsyncThunk<void, void>(
	'logging/exportLogs',
	async (_payload, {}) => {
		console.info('exporting logs');
		try {
			const zipFileToShare = path.join(
				ReactNativeBlobUtil.fs.dirs.CacheDir,
				'logs.zip'
			);

			try {
				await zip(LOGS_DIRECTORY, zipFileToShare);

				await Share.open({
					url: `file://${zipFileToShare}`
				});
			} catch (error) {
				console.error(error);
			} finally {
				await removeFile(zipFileToShare);
			}
		} catch (error) {
			console.error(error);
		}
	}
);

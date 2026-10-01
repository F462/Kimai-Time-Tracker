import path from 'path';
import ReactNativeBlobUtil from 'react-native-blob-util';
import {FileLogger} from 'react-native-file-logger';

export const LOGS_DIRECTORY = path.join(
	ReactNativeBlobUtil.fs.dirs.CacheDir,
	'logs',
);

FileLogger.configure({
	logsDirectory: LOGS_DIRECTORY,
})
	.then(() => {
		console.info('File logger initialized');
	})
	.catch(console.error);

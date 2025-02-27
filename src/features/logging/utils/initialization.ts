import {FileLogger} from 'react-native-file-logger';
import ReactNativeBlobUtil from 'react-native-blob-util';
import path from 'path';

export const LOGS_DIRECTORY = path.join(
	ReactNativeBlobUtil.fs.dirs.CacheDir,
	'logs'
);

FileLogger.configure({
	logsDirectory: LOGS_DIRECTORY
})
	.then(() => {
		FileLogger.info('File logger initialized');
	})
	.catch(FileLogger.error);

import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeBlobUtil from 'react-native-blob-util';

import {
	deleteSharedFolderFile,
	readSharedFolderFile,
	releaseSharedFolder,
	sharedFolderFileExists,
	writeSharedFolderFile,
} from './sharedFolderStorage';

type LegacyStorage = {
	getItem: (key: string) => Promise<string | null>;
	setItem: (key: string, value: string) => Promise<unknown>;
	removeItem: (key: string) => Promise<unknown>;
};

type FileSystem = {
	exists: (path: string) => Promise<boolean>;
	mkdir: (path: string) => Promise<void>;
	readFile: (path: string, encoding: 'utf8') => Promise<string>;
	writeFile: (path: string, value: string, encoding: 'utf8') => Promise<void>;
	unlink: (path: string) => Promise<void>;
};

type FileStorageOptions = {
	directory: string;
	fileSystem: FileSystem;
	legacyStorage: LegacyStorage;
	pathStorageKey?: string;
	folderStorageKey?: string;
	folderNameStorageKey?: string;
	sharedStorage?: {
		exists: (uri: string, name: string) => Promise<boolean>;
		readFile: (uri: string, name: string) => Promise<string>;
		writeFile: (uri: string, name: string, value: string) => Promise<void>;
		deleteFile: (uri: string, name: string) => Promise<void>;
		releaseFolder: (uri: string) => Promise<void>;
	};
};

export const createFileStorage = ({
	directory,
	fileSystem,
	legacyStorage,
	pathStorageKey = 'kimai.persistence.directory',
	folderStorageKey = 'kimai.persistence.folder-uri',
	folderNameStorageKey = 'kimai.persistence.folder-name',
	sharedStorage = {
		exists: sharedFolderFileExists,
		readFile: readSharedFolderFile,
		writeFile: writeSharedFolderFile,
		deleteFile: deleteSharedFolderFile,
		releaseFolder: releaseSharedFolder,
	},
}: FileStorageOptions) => {
	let relativeDirectory: string | undefined;
	let sharedFolderUri: string | undefined;
	let sharedFolderName: string | undefined;
	let operationQueue: Promise<void> = Promise.resolve();

	const directoryForPath = (path: string) =>
		path ? `${directory}/${path}` : directory;

	const ensureDirectory = async (path: string) => {
		let current = directory;
		for (const segment of path.split('/').filter(Boolean)) {
			current = `${current}/${segment}`;
			if (!(await fileSystem.exists(current))) {
				await fileSystem.mkdir(current);
			}
		}
	};

	const initialize = async () => {
		if (relativeDirectory === undefined) {
			const savedPath = await legacyStorage.getItem(pathStorageKey);
			relativeDirectory = savedPath ?? '';
			sharedFolderUri =
				(await legacyStorage.getItem(folderStorageKey)) ?? undefined;
			sharedFolderName =
				(await legacyStorage.getItem(folderNameStorageKey)) ?? undefined;
		}
		if (!sharedFolderUri) {
			await ensureDirectory(relativeDirectory);
		}
		return relativeDirectory;
	};

	const pathForKey = (key: string, relativePath: string) =>
		`${directoryForPath(relativePath)}/redux-persist-${encodeURIComponent(key)}.json`;

	const runExclusive = <T>(operation: () => Promise<T>) => {
		const result = operationQueue.then(operation);
		operationQueue = result.then(
			() => undefined,
			() => undefined,
		);
		return result;
	};

	const setItem = (key: string, value: string) =>
		runExclusive(async () => {
			const currentDirectory = await initialize();
			if (sharedFolderUri) {
				await fileSystem.writeFile(
					pathForKey(key, currentDirectory),
					value,
					'utf8',
				);
				await sharedStorage.writeFile(
					sharedFolderUri,
					`redux-persist-${encodeURIComponent(key)}.json`,
					value,
				);
			} else {
				await fileSystem.writeFile(
					pathForKey(key, currentDirectory),
					value,
					'utf8',
				);
			}
		});

	const readStoredItem = async (key: string, currentDirectory: string) => {
		if (sharedFolderUri) {
			const filename = `redux-persist-${encodeURIComponent(key)}.json`;
			try {
				if (await sharedStorage.exists(sharedFolderUri, filename)) {
					const externalValue = await sharedStorage.readFile(
						sharedFolderUri,
						filename,
					);
					await fileSystem.writeFile(
						pathForKey(key, currentDirectory),
						externalValue,
						'utf8',
					);
					return externalValue;
				}
			} catch {
				// Use the private copy when a provider is offline or permission was revoked.
			}
			const backupPath = pathForKey(key, currentDirectory);
			if (await fileSystem.exists(backupPath)) {
				return fileSystem.readFile(backupPath, 'utf8');
			}
		} else {
			const path = pathForKey(key, currentDirectory);
			if (await fileSystem.exists(path)) {
				return fileSystem.readFile(path, 'utf8');
			}
		}

		return legacyStorage.getItem(key);
	};

	return {
		getItem: (key: string) =>
			runExclusive(async () => {
				const currentDirectory = await initialize();
				const legacyValue = await readStoredItem(key, currentDirectory);
				if (legacyValue !== null) {
					if (sharedFolderUri) {
						await sharedStorage.writeFile(
							sharedFolderUri,
							`redux-persist-${encodeURIComponent(key)}.json`,
							legacyValue,
						);
					} else {
						await fileSystem.writeFile(
							pathForKey(key, currentDirectory),
							legacyValue,
							'utf8',
						);
					}
					await legacyStorage.removeItem(key);
				}

				return legacyValue;
			}),
		setItem,
		removeItem: (key: string) =>
			runExclusive(async () => {
				const currentDirectory = await initialize();
				if (sharedFolderUri) {
					await sharedStorage.deleteFile(
						sharedFolderUri,
						`redux-persist-${encodeURIComponent(key)}.json`,
					);
				}
				const path = pathForKey(key, currentDirectory);
				if (await fileSystem.exists(path)) {
					await fileSystem.unlink(path);
				}
				await legacyStorage.removeItem(key);
			}),
		getDirectory: () =>
			runExclusive(async () => {
				const currentDirectory = await initialize();
				return sharedFolderName ?? (currentDirectory || '');
			}),
		setExternalDirectory: (uri: string | null, name = '') =>
			runExclusive(async () => {
				const currentDirectory = await initialize();
				if (uri === sharedFolderUri) {
					return;
				}

				const filename = 'redux-persist-root.json';
				const currentValue = await readStoredItem('root', currentDirectory);
				if (uri) {
					let nextValue = currentValue;
					if (await sharedStorage.exists(uri, filename)) {
						nextValue = await sharedStorage.readFile(uri, filename);
						JSON.parse(nextValue);
					}
					if (nextValue !== null) {
						await fileSystem.writeFile(
							pathForKey('root', currentDirectory),
							nextValue,
							'utf8',
						);
					}
					if (
						!(await sharedStorage.exists(uri, filename)) &&
						currentValue !== null
					) {
						await sharedStorage.writeFile(uri, filename, currentValue);
					}
					await legacyStorage.setItem(folderStorageKey, uri);
					await legacyStorage.setItem(folderNameStorageKey, name);
				} else {
					await ensureDirectory(currentDirectory);
					const currentPath = pathForKey('root', currentDirectory);
					if (currentValue !== null) {
						await fileSystem.writeFile(currentPath, currentValue, 'utf8');
					}
					await legacyStorage.removeItem(folderStorageKey);
					await legacyStorage.removeItem(folderNameStorageKey);
				}

				const previousUri = sharedFolderUri;
				sharedFolderUri = uri ?? undefined;
				sharedFolderName = uri ? name : undefined;
				if (previousUri) {
					sharedStorage.releaseFolder(previousUri).catch(() => undefined);
				}
			}),
	};
};

const fileStorage = createFileStorage({
	directory: ReactNativeBlobUtil.fs.dirs.DocumentDir,
	fileSystem: ReactNativeBlobUtil.fs,
	legacyStorage: AsyncStorage,
});

export default fileStorage;

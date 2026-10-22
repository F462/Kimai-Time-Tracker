import {NativeModules} from 'react-native';

export type SharedFolder = {
	uri: string;
	name: string;
};

type NativeSharedFolderStorage = {
	pickFolder: () => Promise<SharedFolder>;
	releaseFolder?: (uri: string) => Promise<void>;
	exists: (uri: string, name: string) => Promise<boolean>;
	readFile: (uri: string, name: string) => Promise<string>;
	writeFile: (uri: string, name: string, value: string) => Promise<void>;
	deleteFile: (uri: string, name: string) => Promise<void>;
};

const nativeStorage = NativeModules.SharedFolderStorage as
	NativeSharedFolderStorage | undefined;

const requireNativeStorage = () => {
	if (!nativeStorage) {
		throw new Error('Shared folder storage is unavailable on this platform');
	}
	return nativeStorage;
};

export const pickSharedFolder = () => requireNativeStorage().pickFolder();
export const releaseSharedFolder = (uri: string) =>
	requireNativeStorage().releaseFolder?.(uri) ?? Promise.resolve();
export const sharedFolderFileExists = (uri: string, name: string) =>
	requireNativeStorage().exists(uri, name);
export const readSharedFolderFile = (uri: string, name: string) =>
	requireNativeStorage().readFile(uri, name);
export const writeSharedFolderFile = (
	uri: string,
	name: string,
	value: string,
) => requireNativeStorage().writeFile(uri, name, value);
export const deleteSharedFolderFile = (uri: string, name: string) =>
	requireNativeStorage().deleteFile(uri, name);

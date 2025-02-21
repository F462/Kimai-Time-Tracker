import EncryptedStorage from 'react-native-encrypted-storage';
import {FileLogger} from 'react-native-file-logger';

const API_TOKEN_STORE_KEY = 'apiToken';

export async function storeApiToken(apiToken: string) {
	try {
		await EncryptedStorage.setItem(API_TOKEN_STORE_KEY, apiToken);
	} catch (error: any) {
		FileLogger.error(`Error storing API token: ${error.toString()}`);
	}
}

export async function removeApiToken() {
	try {
		await EncryptedStorage.removeItem(API_TOKEN_STORE_KEY);
	} catch (error: any) {
		FileLogger.error(`Error removing API token: ${error.toString()}`);
	}
}

export async function getApiToken() {
	try {
		return await EncryptedStorage.getItem(API_TOKEN_STORE_KEY);
	} catch (error: any) {
		FileLogger.error(`Error reading API token: ${error.toString()}`);
	}
}

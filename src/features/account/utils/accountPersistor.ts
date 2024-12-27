import EncryptedStorage from 'react-native-encrypted-storage';

const API_KEY_STORE_KEY = 'apiKey';

export async function storeApiKey(apiKey: string) {
	try {
		await EncryptedStorage.setItem(API_KEY_STORE_KEY, apiKey);
	} catch (error: any) {
		console.error(`Error storing API key: ${error.toString()}`);
	}
}

export async function getApiKey() {
	try {
		return await EncryptedStorage.getItem(API_KEY_STORE_KEY);
	} catch (error: any) {
		console.error(`Error reading API key: ${error.toString()}`);
	}
}

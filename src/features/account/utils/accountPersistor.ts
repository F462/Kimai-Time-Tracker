import EncryptedStorage from 'react-native-encrypted-storage';

const API_TOKEN_STORE_KEY = 'apiToken';

export async function storeApiToken(apiToken: string) {
	try {
		await EncryptedStorage.setItem(API_TOKEN_STORE_KEY, apiToken);
	} catch (error: any) {
		console.error(`Error storing API token: ${error.toString()}`);
	}
}

export async function getApiToken() {
	try {
		return await EncryptedStorage.getItem(API_TOKEN_STORE_KEY);
	} catch (error: any) {
		console.error(`Error reading API token: ${error.toString()}`);
	}
}

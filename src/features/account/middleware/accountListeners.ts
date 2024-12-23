import axios from 'axios';

import {apiKeyReceived, axiosHeadersSet} from '../context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';

export const setAxiosHeadersOnApiKeyReceived = (
	startListening: AppStartListening
) => {
	startListening({
		actionCreator: apiKeyReceived,
		effect: async ({payload: apiKey}, listenerApi) => {
			axios.defaults.headers.common.Authorization = `Bearer ${apiKey}`;
			listenerApi.dispatch(axiosHeadersSet());
		}
	});
};

export const startAccountListeners = (startListening: AppStartListening) => {
	setAxiosHeadersOnApiKeyReceived(startListening);
};

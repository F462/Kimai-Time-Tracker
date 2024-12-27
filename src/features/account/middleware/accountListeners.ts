import axios from 'axios';

import {apiKeyReceived, axiosHeadersSet} from '../context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {REHYDRATE} from 'redux-persist';
import {selectApiKey} from '../context/accountSelectors';

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

export const setAxiosHeadersOnAppStart = (
	startListening: AppStartListening
) => {
	startListening({
		type: REHYDRATE,
		effect: async (_, listenerApi) => {
			const apiKey = selectApiKey(listenerApi.getState());

			if (apiKey === undefined) {
				return;
			}

			axios.defaults.headers.common.Authorization = `Bearer ${apiKey}`;
			listenerApi.dispatch(axiosHeadersSet());
		}
	});
};

export const startAccountListeners = (startListening: AppStartListening) => {
	setAxiosHeadersOnApiKeyReceived(startListening);
	setAxiosHeadersOnAppStart(startListening);
};

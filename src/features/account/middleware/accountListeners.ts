import {AppStartListening} from 'src/features/data/context/store';
import {REHYDRATE} from 'redux-persist';
import {loginUser} from './accountThunks';
import {selectServerUrl} from '../context/accountSelectors';

export const setAxiosHeadersOnAppStart = (
	startListening: AppStartListening
) => {
	startListening({
		type: REHYDRATE,
		effect: async (_, listenerApi) => {
			const serverUrl = selectServerUrl(listenerApi.getState());

			if (serverUrl === undefined) {
				return;
			}

			listenerApi.dispatch(loginUser({serverUrl})).catch(console.error);
		}
	});
};

export const startAccountListeners = (startListening: AppStartListening) => {
	setAxiosHeadersOnAppStart(startListening);
};

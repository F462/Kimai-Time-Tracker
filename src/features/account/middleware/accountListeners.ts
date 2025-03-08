import {FileLogger} from 'react-native-file-logger';
import {REHYDRATE} from 'redux-persist';

import {AppStartListening} from 'src/features/data/context/store';
import {loginUser} from './accountThunks';
import {selectServerUrl} from '../context/accountSelectors';

const setAxiosHeadersOnAppStart = (startListening: AppStartListening) => {
	startListening({
		type: REHYDRATE,
		effect: async (_, listenerApi) => {
			const serverUrl = selectServerUrl(listenerApi.getState());

			if (serverUrl === undefined) {
				return;
			}

			listenerApi.dispatch(loginUser({serverUrl})).catch(FileLogger.error);
		}
	});
};

export const startAccountListeners = (startListening: AppStartListening) => {
	setAxiosHeadersOnAppStart(startListening);
};

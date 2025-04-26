import {REHYDRATE} from 'redux-persist';
import {addEventListener} from '@react-native-community/netinfo';

import {AppStartListening} from 'src/features/data/context/store';
import {internetReachabilityChanged} from '../context/networkSlice';
import {selectIsInternetReachable} from '../context/networkSelector';

const startNetworkEventListener = (startListening: AppStartListening) => {
	startListening({
		type: REHYDRATE,
		effect: async (_, listenerApi) => {
			addEventListener((state) => {
				const newInternetState = state.isInternetReachable;
				const oldInternetState = selectIsInternetReachable(
					listenerApi.getState(),
				);
				if (oldInternetState !== newInternetState) {
					listenerApi.dispatch(internetReachabilityChanged(newInternetState));
				}
			});
		},
	});
};

export const startNetworkListeners = (startListening: AppStartListening) => {
	startNetworkEventListener(startListening);
};

import {userLoggedIn} from 'src/features/account/context/accountActions';
import {AppStartListening} from 'src/features/data/context/store';
import {internetReachabilityChanged} from 'src/features/network/context/networkSlice';
import {fetchCustomers, synchronizeLocalCustomers} from './customersThunks';

const fetchCustomersOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(synchronizeLocalCustomers());
			await listenerApi.dispatch(fetchCustomers());
		},
	});
};

const synchronizeCustomersOnReconnect = (startListening: AppStartListening) => {
	startListening({
		actionCreator: internetReachabilityChanged,
		effect: async ({payload: isInternetReachable}, listenerApi) => {
			if (isInternetReachable) {
				await listenerApi.dispatch(synchronizeLocalCustomers());
			}
		},
	});
};

export const startCustomerListeners = (startListening: AppStartListening) => {
	fetchCustomersOnUserLogin(startListening);
	synchronizeCustomersOnReconnect(startListening);
};

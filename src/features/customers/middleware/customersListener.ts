import {AppStartListening} from 'src/features/data/context/store';
import {axiosHeadersSet} from 'src/features/account/context/accountActions';
import {fetchCustomers} from './customersThunks';

const fetchCustomersOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: axiosHeadersSet,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchCustomers());
		}
	});
};

export const startCustomerListeners = (startListening: AppStartListening) => {
	fetchCustomersOnApiKeyReceived(startListening);
};

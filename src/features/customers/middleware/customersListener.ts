import {AppStartListening} from 'src/features/data/context/store';
import {apiKeyReceived} from 'src/features/account/context/accountActions';
import {fetchCustomers} from './customersThunks';

const fetchCustomersOnApiKeyReceived = (startListening: AppStartListening) => {
	startListening({
		actionCreator: apiKeyReceived,
		effect: async ({payload: _apiKey}, listenerApi) => {
			listenerApi.dispatch(fetchCustomers());
		},
	});
};

export const startCustomerListeners = (startListening: AppStartListening) => {
	fetchCustomersOnApiKeyReceived(startListening);
};

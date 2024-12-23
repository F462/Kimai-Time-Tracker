import {listenerMiddleware} from 'src/features/data/context/store';
import {apiKeyReceived} from '../../account/context/accountSlice';

const fetchCustomersOnApiKeyReceived = () => {
	listenerMiddleware.startListening({
		actionCreator: apiKeyReceived,
		effect: async ({payload: _apiKey}) => {},
	});
};

export const startCustomerListeners = () => {
	fetchCustomersOnApiKeyReceived();
};

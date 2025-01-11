import {AppStartListening} from 'src/features/data/context/store';
import {fetchCustomers} from './customersThunks';
import {userLoggedIn} from 'src/features/account/context/accountActions';

const fetchCustomersOnUserLogin = (startListening: AppStartListening) => {
	startListening({
		actionCreator: userLoggedIn,
		effect: async (_, listenerApi) => {
			await listenerApi.dispatch(fetchCustomers());
		}
	});
};

export const startCustomerListeners = (startListening: AppStartListening) => {
	fetchCustomersOnUserLogin(startListening);
};

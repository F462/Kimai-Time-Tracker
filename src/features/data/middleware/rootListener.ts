import {AppStartListening} from '../context/store';
import {startAccountListeners} from 'src/features/account/middleware/accountListeners';
import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';

export const startRootListener = (startListening: AppStartListening) => {
	startCustomerListeners(startListening);
	startAccountListeners(startListening);
};

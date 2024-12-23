import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';
import {AppStartListening} from '../context/store';
import {startAccountListeners} from 'src/features/account/middleware/accountListeners';

export const startRootListener = (startListening: AppStartListening) => {
	startCustomerListeners(startListening);
	startAccountListeners(startListening);
};

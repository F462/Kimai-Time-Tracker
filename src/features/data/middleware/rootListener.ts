import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';
import {AppStartListening} from '../context/store';

export const startRootListener = (startListening: AppStartListening) => {
	startCustomerListeners(startListening);
};

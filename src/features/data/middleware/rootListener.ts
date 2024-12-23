import {AppStartListening} from '../context/store';
import {startAccountListeners} from 'src/features/account/middleware/accountListeners';
import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';
import {startProjectListeners} from 'src/features/projects/middleware/projectsListener';

export const startRootListener = (startListening: AppStartListening) => {
	startAccountListeners(startListening);
	startCustomerListeners(startListening);
	startProjectListeners(startListening);
};

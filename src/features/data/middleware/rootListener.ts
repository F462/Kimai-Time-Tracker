import {startCustomerListeners} from 'src/features/customers/middleware/customersListener';

export const startRootListener = () => {
	startCustomerListeners();
};

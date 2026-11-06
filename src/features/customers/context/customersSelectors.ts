import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectCustomersState = (state: RootState) => state.customers;

const selectCustomers = createSelector(
	[selectCustomersState],
	(customers) => customers.customers,
);

export const selectCustomerList = createSelector(
	[selectCustomers],
	(customers) => Object.values(customers),
);

export const selectHasUnsynchronizedCustomers = createSelector(
	[selectCustomers],
	(customers) => Object.values(customers).some((customer) => customer.id < 0),
);

export const selectSelectedCustomerId = createSelector(
	[selectCustomersState],
	(customerState) => customerState.selectedCustomerId,
);

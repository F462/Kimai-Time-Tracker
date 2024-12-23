import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectCustomers = (state: RootState) => state.customers;

export const selectCustomerList = createSelector(
	[selectCustomers],
	customers => customers.customerList
);

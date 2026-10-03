import {createSlice, PayloadAction} from '@reduxjs/toolkit';

import {Customer, CustomersState} from '../types';

const initialState: CustomersState = {
	customers: {},
	selectedCustomerId: undefined,
};

const customersSlice = createSlice({
	name: 'customers',
	initialState,
	reducers: {
		customersReceived: (state, {payload}: PayloadAction<Array<Customer>>) => {
			state.customers = payload;
		},
		customerSelected: (
			state,
			{payload: customerId}: PayloadAction<number | undefined>,
		) => {
			state.selectedCustomerId = customerId;
		},
		customerRemoved: (state, {payload: customerId}: PayloadAction<number>) => {
			delete state.customers[customerId];

			if (state.selectedCustomerId === customerId) {
				state.selectedCustomerId = undefined;
			}
		},
		customerUpdated: (state, {payload: customer}: PayloadAction<Customer>) => {
			state.customers[customer.id] = customer;
		},
	},
});

export const {
	customersReceived,
	customerSelected,
	customerRemoved,
	customerUpdated,
} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

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
			const localCustomers = Object.values(state.customers).filter(
				(customer) => customer.id < 0,
			);
			state.customers = payload.reduce(
				(container, customer) => ({...container, [customer.id]: customer}),
				Object.fromEntries(
					localCustomers.map((customer) => [customer.id, customer]),
				),
			);
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
		customerCreated: (state, {payload: customer}: PayloadAction<Customer>) => {
			state.customers[customer.id] = customer;
		},
		customerSynced: (
			state,
			{
				payload: {localId, customer},
			}: PayloadAction<{localId: number; customer: Customer}>,
		) => {
			delete state.customers[localId];
			state.customers[customer.id] = customer;
			if (state.selectedCustomerId === localId) {
				state.selectedCustomerId = customer.id;
			}
		},
	},
});

export const {
	customersReceived,
	customerSelected,
	customerRemoved,
	customerUpdated,
	customerCreated,
	customerSynced,
} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

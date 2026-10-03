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
	},
});

export const {customersReceived, customerSelected, customerRemoved} =
	customersSlice.actions;
export const customersReducer = customersSlice.reducer;

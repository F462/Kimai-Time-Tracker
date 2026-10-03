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
	},
});

export const {customersReceived, customerSelected} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

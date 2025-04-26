import {PayloadAction, createSlice} from '@reduxjs/toolkit';

import {Customer, CustomersState} from '../types';

const initialState: CustomersState = {
	customers: {},
};

const customersSlice = createSlice({
	name: 'customers',
	initialState,
	reducers: {
		customersReceived: (state, {payload}: PayloadAction<Array<Customer>>) => {
			state.customers = payload;
		},
	},
});

export const {customersReceived} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

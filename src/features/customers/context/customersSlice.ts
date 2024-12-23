import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {CustomersState} from '../types';

const initialState: CustomersState = {
	customerList: [],
};

const customersSlice = createSlice({
	name: 'customers',
	initialState,
	reducers: {
		customersReceived: (
			state,
			{payload}: PayloadAction<CustomersState['customerList']>,
		) => {
			state.customerList = payload;
		},
	},
});

export const {customersReceived} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

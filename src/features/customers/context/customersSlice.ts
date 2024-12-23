import {createSlice} from '@reduxjs/toolkit';
import {CustomersState} from '../types';

const initialState: CustomersState = {};

const customersSlice = createSlice({
	name: 'customers',
	initialState,
	reducers: {},
});

export const {} = customersSlice.actions;
export const customersReducer = customersSlice.reducer;

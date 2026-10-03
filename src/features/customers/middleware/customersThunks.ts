import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	customerRemoved,
	customersReceived,
	customerUpdated,
} from '../context/customersSlice';
import {Customer} from '../types';

export const fetchCustomers = createAppAsyncThunk(
	'customers/fetchCustomers',
	async (_, {dispatch}) => {
		try {
			const response = await api.get<Array<Customer>>('api/customers');
			dispatch(customersReceived(response));
		} catch (error: any) {
			console.warn(`Got error on fetch request: ${error.toString()}`);
		}
	},
);

export const removeCustomer = createAppAsyncThunk<void, number>(
	'customers/removeCustomer',
	async (customerId, {dispatch}) => {
		try {
			await api.delete(`api/customers/${customerId.toString()}`);
			dispatch(customerRemoved(customerId));
		} catch (error: any) {
			console.warn(`Got error on delete request: ${error.toString()}`);
		}
	},
);

export const updateCustomer = createAppAsyncThunk(
	'customers/updateCustomer',
	async (customer: Customer, {dispatch}) => {
		try {
			const response = await api.patch<Customer>(
				`api/customers/${customer.id.toString()}`,
				{
					name: customer.name,
					number: customer.number,
					comment: customer.comment,
					visible: customer.visible,
					billable: customer.billable,
				},
			);
			dispatch(customerUpdated(response));
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
		}
	},
);

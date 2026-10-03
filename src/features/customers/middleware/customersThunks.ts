import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	customerCreated,
	customerRemoved,
	customersReceived,
	customerUpdated,
} from '../context/customersSlice';
import {Customer} from '../types';

export type CreateCustomerPayload = {
	name: string;
	number?: string | null;
	comment?: string | null;
	visible?: boolean;
	billable?: boolean;
};

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

export const createCustomer = createAppAsyncThunk<
	Customer,
	CreateCustomerPayload
>('customers/createCustomer', async (payload, {dispatch}) => {
	const body: Record<string, unknown> = {
		name: payload.name,
	};

	if (payload.number !== undefined && payload.number !== null) {
		body.number = payload.number;
	}

	if (payload.comment !== undefined && payload.comment !== null) {
		body.comment = payload.comment;
	}

	body.visible = payload.visible ?? true;
	body.billable = payload.billable ?? true;

	const response = await api.post<Customer>('api/customers', body);

	dispatch(customerCreated(response));

	return response;
});

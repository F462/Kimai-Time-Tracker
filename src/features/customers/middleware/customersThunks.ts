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
	country: string;
	language: string;
	currency: string;
	timezone?: string;
	number?: string | null;
	comment?: string | null;
	company?: string;
	street?: string;
	zipcode?: string;
	city?: string;
	color?: string | null;
	visible?: boolean;
	billable?: boolean;
	vatId?: string;
	invoiceEmail?: string;
	buyerReference?: string;
	invoiceTemplate?: string;
	invoiceText?: string;
};

export const fetchCustomerColors = createAppAsyncThunk(
	'customers/fetchCustomerColors',
	async () => api.get<Record<string, string>>('api/config/colors'),
);

const resolveDefaultTimezone = (): string => {
	try {
		return new Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC';
	} catch {
		return 'UTC';
	}
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
					country: customer.country,
					company: customer.company ?? '',
					street: customer.street ?? '',
					zipcode: customer.zipcode ?? '',
					city: customer.city ?? '',
					timezone: customer.timezone,
					language: customer.language,
					currency: customer.currency,
					color: customer.color,
					visible: customer.visible,
					billable: customer.billable,
					// These are returned by the API, so sending them (even empty)
					// lets the user clear the value.
					vatId: customer.vatId ?? '',
					invoiceEmail: customer.invoiceEmail ?? '',
					buyerReference: customer.buyerReference ?? '',
					// The API does not return these on GET, so we only send them
					// when they carry a value. Sending an empty string would wipe
					// data we were unable to read back.
					...(customer.invoiceText ? {invoiceText: customer.invoiceText} : {}),
					...(customer.invoiceTemplate
						? {invoiceTemplate: customer.invoiceTemplate}
						: {}),
				},
			);
			dispatch(customerUpdated(response));
			return response;
		} catch (error: any) {
			console.warn(`Got error on update request: ${error.toString()}`);
			throw error;
		}
	},
);

export const createCustomer = createAppAsyncThunk<
	Customer,
	CreateCustomerPayload
>('customers/createCustomer', async (payload, {dispatch}) => {
	const body: Record<string, unknown> = {
		name: payload.name,
		country: payload.country,
		company: payload.company,
		street: payload.street,
		zipcode: payload.zipcode,
		city: payload.city,
		language: payload.language,
		currency: payload.currency,
		timezone: payload.timezone ?? resolveDefaultTimezone(),
	};

	if (payload.number !== undefined && payload.number !== null) {
		body.number = payload.number;
	}

	if (payload.comment !== undefined && payload.comment !== null) {
		body.comment = payload.comment;
	}

	if (payload.color !== undefined && payload.color !== null) {
		body.color = payload.color;
	}

	body.visible = payload.visible ?? true;
	body.billable = payload.billable ?? true;

	// Invoice settings: only sent when a value is present.
	if (payload.vatId) {
		body.vatId = payload.vatId;
	}

	if (payload.invoiceEmail) {
		body.invoiceEmail = payload.invoiceEmail;
	}

	if (payload.buyerReference) {
		body.buyerReference = payload.buyerReference;
	}

	if (payload.invoiceTemplate) {
		body.invoiceTemplate = payload.invoiceTemplate;
	}

	if (payload.invoiceText) {
		body.invoiceText = payload.invoiceText;
	}

	const response = await api.post<Customer>('api/customers', body);

	dispatch(customerCreated(response));

	return response;
});

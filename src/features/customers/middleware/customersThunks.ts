import {api} from 'src/features/account/utils/ApiClient';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {
	customerCreated,
	customerRemoved,
	customersReceived,
	customerSynced,
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

const createCustomerBody = (payload: CreateCustomerPayload) => {
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

	return body;
};

const createLocalCustomer = (
	payload: CreateCustomerPayload,
	customers: {[id: number]: Customer},
): Customer => {
	const localIds = Object.keys(customers)
		.map(Number)
		.filter((id) => Number.isInteger(id) && id < 0);
	const id = localIds.length > 0 ? Math.min(...localIds) - 1 : -1;

	return {
		id,
		name: payload.name,
		number: payload.number ?? '',
		comment: payload.comment ?? null,
		country: payload.country,
		company: payload.company,
		street: payload.street,
		zipcode: payload.zipcode,
		city: payload.city,
		timezone: payload.timezone ?? resolveDefaultTimezone(),
		language: payload.language,
		currency: payload.currency,
		visible: payload.visible ?? true,
		billable: payload.billable ?? true,
		metaFields: [],
		teams: [],
		color: payload.color ?? null,
		vatId: payload.vatId,
		invoiceEmail: payload.invoiceEmail,
		buyerReference: payload.buyerReference,
		invoiceTemplate: payload.invoiceTemplate,
		invoiceText: payload.invoiceText,
	};
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
		if (customerId < 0) {
			dispatch(customerRemoved(customerId));
			return;
		}

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
		if (customer.id < 0) {
			dispatch(customerUpdated(customer));
			return customer;
		}

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
>('customers/createCustomer', async (payload, {dispatch, getState}) => {
	const saveLocally = () => {
		const customer = createLocalCustomer(
			payload,
			getState().customers.customers,
		);
		dispatch(customerCreated(customer));
		return customer;
	};

	if (!api.isConfigured()) {
		return saveLocally();
	}

	try {
		const response = await api.post<Customer>(
			'api/customers',
			createCustomerBody(payload),
		);
		dispatch(customerCreated(response));
		return response;
	} catch (error: any) {
		if (error?.status === undefined) {
			return saveLocally();
		}
		throw error;
	}
});

export const synchronizeLocalCustomers = createAppAsyncThunk(
	'customers/synchronizeLocalCustomers',
	async (_, {dispatch, getState}) => {
		if (!api.isConfigured()) {
			return;
		}

		const localCustomers = Object.values(getState().customers.customers)
			.filter((customer) => customer.id < 0)
			.sort((first, second) => first.id - second.id);

		for (const customer of localCustomers) {
			try {
				const response = await api.post<Customer>(
					'api/customers',
					createCustomerBody(customer),
				);
				dispatch(customerSynced({localId: customer.id, customer: response}));
			} catch (error: any) {
				console.warn(
					`Could not synchronize local customer: ${error.toString()}`,
				);
			}
		}
	},
);

import {configureStore} from '@reduxjs/toolkit';

import {api} from 'src/features/account/utils/ApiClient';
import {customersReducer} from 'src/features/customers/context/customersSlice';
import {
	createCustomer,
	fetchCustomerColors,
	updateCustomer,
} from 'src/features/customers/middleware/customersThunks';
import {Customer} from 'src/features/customers/types';
import type {AppDispatch} from 'src/features/data/context/store';

jest.mock('src/features/account/utils/ApiClient', () => ({
	api: {get: jest.fn(), post: jest.fn(), patch: jest.fn(), delete: jest.fn()},
	ApiClient: {getInstance: jest.fn()},
}));

const makeCustomer = (): Customer => ({
	id: 9,
	name: 'Example customer',
	number: 'C-9',
	comment: 'Customer note',
	country: 'US',
	language: 'en',
	currency: 'USD',
	visible: true,
	billable: true,
	metaFields: [],
	teams: [],
	color: null,
});

const configureTestStore = () =>
	configureStore({reducer: {customers: customersReducer}});

type TestStore = Omit<ReturnType<typeof configureTestStore>, 'dispatch'> & {
	dispatch: AppDispatch;
};

describe('customer thunks', () => {
	beforeEach(() => {
		jest.clearAllMocks();
	});

	it('posts all required customer fields when creating', async () => {
		const customer = makeCustomer();
		(api.post as jest.Mock).mockResolvedValue(customer);
		const store = configureTestStore() as TestStore;

		await store.dispatch(
			createCustomer({
				name: customer.name,
				country: customer.country,
				language: customer.language,
				currency: customer.currency,
			}),
		);

		expect(api.post).toHaveBeenCalledWith('api/customers', {
			name: customer.name,
			country: customer.country,
			language: customer.language,
			currency: customer.currency,
			timezone: expect.any(String),
			visible: true,
			billable: true,
		});
		expect(store.getState().customers.customers[customer.id]).toEqual(customer);
	});

	it('fetches the server-configured customer colors', async () => {
		const colors = {Red: '#ff0000', Blue: '#0000ff'};
		(api.get as jest.Mock).mockResolvedValue(colors);
		const store = configureTestStore() as TestStore;

		await expect(
			store.dispatch(fetchCustomerColors()).unwrap(),
		).resolves.toEqual(colors);
		expect(api.get).toHaveBeenCalledWith('api/config/colors');
	});

	it('patches all required customer fields when updating', async () => {
		const customer = makeCustomer();
		(api.patch as jest.Mock).mockResolvedValue(customer);
		const store = configureTestStore() as TestStore;

		await store.dispatch(updateCustomer(customer));

		expect(api.patch).toHaveBeenCalledWith('api/customers/9', {
			name: customer.name,
			number: customer.number,
			comment: customer.comment,
			country: customer.country,
			language: customer.language,
			currency: customer.currency,
			color: customer.color,
			visible: customer.visible,
			billable: customer.billable,
		});
		expect(store.getState().customers.customers[customer.id]).toEqual(customer);
	});

	it('rejects with the server error when creating is rejected', async () => {
		const customer = makeCustomer();
		(api.post as jest.Mock).mockRejectedValue(
			new Error('Validation Failed: color: The selected choice is invalid.'),
		);
		const store = configureTestStore() as TestStore;

		const resultAction = await store.dispatch(
			createCustomer({
				name: customer.name,
				country: customer.country,
				language: customer.language,
				currency: customer.currency,
			}),
		);

		if (!createCustomer.rejected.match(resultAction)) {
			throw new Error('Expected the createCustomer thunk to be rejected');
		}
		expect(resultAction.error?.message).toBe(
			'Validation Failed: color: The selected choice is invalid.',
		);
		expect(store.getState().customers.customers).toEqual({});
	});

	it('rejects with the server error when updating is rejected', async () => {
		const customer = makeCustomer();
		(api.patch as jest.Mock).mockRejectedValue(
			new Error('Validation Failed: color: The selected choice is invalid.'),
		);
		const consoleWarnSpy = jest
			.spyOn(console, 'warn')
			.mockImplementation(() => {});
		const store = configureTestStore() as TestStore;

		const resultAction = await store.dispatch(updateCustomer(customer));
		consoleWarnSpy.mockRestore();

		if (!updateCustomer.rejected.match(resultAction)) {
			throw new Error('Expected the updateCustomer thunk to be rejected');
		}
		expect(resultAction.error?.message).toBe(
			'Validation Failed: color: The selected choice is invalid.',
		);
		expect(store.getState().customers.customers).toEqual({});
	});
});

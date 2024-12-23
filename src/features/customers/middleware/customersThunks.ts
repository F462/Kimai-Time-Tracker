import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';
import axios from 'axios';
import path from 'path';
import {customersReceived} from '../context/customersSlice';
import {Customer} from '../types';

export const fetchCustomers = createAppAsyncThunk(
	'customers/fetchCustomers',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Customer>>(
				path.join(serverUrl, 'api/customers'),
			);
			dispatch(customersReceived(response.data));
		} catch (error: any) {
			console.warn('Got error on axios request: ', error.toString());
		}
	},
);

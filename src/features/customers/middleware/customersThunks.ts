import {FileLogger} from 'react-native-file-logger';
import axios from 'axios';
import path from 'path';

import {Customer} from '../types';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {customersReceived} from '../context/customersSlice';
import {selectServerUrl} from 'src/features/account/context/accountSelectors';

export const fetchCustomers = createAppAsyncThunk(
	'customers/fetchCustomers',
	async (_, {dispatch, getState}) => {
		const serverUrl = selectServerUrl(getState());

		if (serverUrl === undefined) {
			throw Error('Server URL is undefined');
		}

		try {
			const response = await axios.get<Array<Customer>>(
				path.join(serverUrl, 'api/customers')
			);
			dispatch(customersReceived(response.data));
		} catch (error: any) {
			FileLogger.warn(`Got error on axios request: ${error.toString()}`);
		}
	}
);

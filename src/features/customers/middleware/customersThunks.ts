import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';

export const fetchCustomers = createAppAsyncThunk(
	'customers/fetchCustomers',
	async (_payload, {}) => {},
);

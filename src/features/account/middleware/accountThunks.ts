import axios from 'axios';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {getApiKey} from '../utils/accountPersistor';
import {userLoggedIn} from '../context/accountActions';

export const loginUser = createAppAsyncThunk<void, {serverUrl: string}>(
	'account/loginUser',
	async ({serverUrl}, {dispatch}) => {
		const apiKey = await getApiKey();

		if (apiKey === null || apiKey === undefined) {
			return;
		}

		axios.defaults.headers.common.Authorization = `Bearer ${apiKey}`;

		dispatch(userLoggedIn(serverUrl));
	}
);

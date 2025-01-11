import axios from 'axios';

import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {getApiToken} from '../utils/accountPersistor';
import {userLoggedIn} from '../context/accountActions';

export const loginUser = createAppAsyncThunk<void, {serverUrl: string}>(
	'account/loginUser',
	async ({serverUrl}, {dispatch}) => {
		const apiToken = await getApiToken();

		if (apiToken === null || apiToken === undefined) {
			return;
		}

		axios.defaults.headers.common.Authorization = `Bearer ${apiToken}`;

		dispatch(userLoggedIn(serverUrl));
	}
);

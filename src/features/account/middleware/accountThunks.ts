import axios from 'axios';

import {userLoggedIn, userLoggedOut} from '../context/accountActions';
import {createAppAsyncThunk} from 'src/features/data/middleware/createAppAsyncThunk';
import {getApiToken} from '../utils/accountPersistor';

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

export const logoutUser = createAppAsyncThunk<void, void>(
	'account/logoutUser',
	async (_payload, {dispatch}) => {
		delete axios.defaults.headers.common.Authorization;

		dispatch(userLoggedOut());
	}
);

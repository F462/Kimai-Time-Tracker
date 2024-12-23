import {createAction} from '@reduxjs/toolkit';

export const apiKeyReceived = createAction<string | undefined>(
	'account/apiKeyReceived',
);
export const serverUrlReceived = createAction<string | undefined>(
	'account/serverUrlReceived',
);

export const axiosHeadersSet = createAction<void>('account/axiosHeadersSet');

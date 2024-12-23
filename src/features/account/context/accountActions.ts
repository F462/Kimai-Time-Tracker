import {createAction} from '@reduxjs/toolkit';

export const apiKeyReceived = createAction<string | undefined>(
	'account/apiKeyReceived',
);

export const axiosHeadersSet = createAction<void>('account/axiosHeadersSet');

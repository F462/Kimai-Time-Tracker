import {createSelector} from '@reduxjs/toolkit';
import {RootState} from 'src/features/data/types';

const selectAccount = (state: RootState) => state.account;

export const selectApiKey = createSelector(
	[selectAccount],
	account => account.apiKey,
);

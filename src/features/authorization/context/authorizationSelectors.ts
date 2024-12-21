import {createSelector} from '@reduxjs/toolkit';
import {RootState} from 'src/features/data/types';

const selectAuthorization = (state: RootState) => state.authorization;

export const selectApiKey = createSelector(
	[selectAuthorization],
	authorization => authorization.apiKey,
);

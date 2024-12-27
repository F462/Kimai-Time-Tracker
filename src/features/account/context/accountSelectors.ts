import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectAccount = (state: RootState) => state.account;

export const selectServerUrl = createSelector(
	[selectAccount],
	account => account.serverUrl
);

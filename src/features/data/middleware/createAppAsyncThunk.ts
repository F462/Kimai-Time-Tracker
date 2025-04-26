// it is needed to be imported here for the actual definition
// eslint-disable-next-line no-restricted-imports
import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch, RootState} from '../context/store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState;
	dispatch: AppDispatch;
}>();

import {createAsyncThunk} from '@reduxjs/toolkit';

import {AppDispatch, RootState} from '../context/store';

export const createAppAsyncThunk = createAsyncThunk.withTypes<{
	state: RootState;
	dispatch: AppDispatch;
}>();

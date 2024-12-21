import {configureStore} from '@reduxjs/toolkit';
import {authorizationReducer} from '../../authorization/context/authorizationSlice';

export const store = configureStore({
  reducer: authorizationReducer,
});

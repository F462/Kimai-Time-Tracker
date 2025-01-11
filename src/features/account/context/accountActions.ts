import {createAction} from '@reduxjs/toolkit';

export const userLoggedIn = createAction<string>('account/userLoggedIn');

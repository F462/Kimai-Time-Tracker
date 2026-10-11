import {createSlice} from '@reduxjs/toolkit';

import {OnboardingState} from '../types';

const initialState: OnboardingState = {};

const onboardingSlice = createSlice({
	name: 'onboarding',
	initialState,
	reducers: {
		developmentWarningShown: (state) => {
			state.hasDevelopmentWarningBeenShown = true;
		},
		notificationPermissionSkipped: (state) => {
			state.hasSkippedNotificationPermission = true;
		},
	},
});

export const {developmentWarningShown, notificationPermissionSkipped} =
	onboardingSlice.actions;
export const onboardingReducer = onboardingSlice.reducer;

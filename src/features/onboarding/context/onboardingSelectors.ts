import {createSelector} from '@reduxjs/toolkit';

import {RootState} from 'src/features/data/context/store';

const selectOnboardingState = (state: RootState) => state.onboarding;

export const selectHasDevelopmentWarningBeenShown = createSelector(
	[selectOnboardingState],
	(onboardingState) => onboardingState.hasDevelopmentWarningBeenShown,
);
